---
layout: post
title: Symfony cumulative ACL isGranted
date: '2016-04-23T14:27:00.000-07:00'
author: jandom
tags: 
modified_time: '2016-04-26T00:34:27.130-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-2300221585378701215
blogger_orig_url: https://jandomanski.blogspot.com/2016/04/symfony-acl-implementations.html
---

The default use of Access Control Lists in Symfony can be a little awkward. That's because the `$securityContext->isGranted` method performs a cumulative permissions check, while the typical implementations of the ACL component's `isGranted` perform a different kind of check. 

Here’s what I mean. Let’s start with a simple security token:

```php
$em = $this->getContainer()->get('doctrine')->getManager();
$aclManager = $this->getContainer()->get('myapp_user.acl_manager');

$repository = $em->getRepository('MyAppUserBundle:User');
$user = $repository->find(1);

$output->writeln(sprintf("user:%d %s", $user->getId(), $user->getUsername()));

$token = new UsernamePasswordToken($user, $user->getPassword(), "firewallname", $user->getRoles());
$securityContext = $this->getContainer()->get('security.token_storage');
$authorizationChecker = $this->getContainer()->get('security.authorization_checker');
$securityContext->setToken($token);
```

Then, let’s print off an ACL record for an example object:

```php
$aclManager = $this->getContainer()->get('myapp_user.acl_manager');
$repository = $em->getRepository('MyAppCoreBundle:Comment');
$entity = $repository->find(1);
$acl = $aclManager->getAcl($entity);

foreach ($acl->getObjectAces() as $ace) {
    $output->writeln(sprintf("%s %s\n", $ace->getSecurityIdentity(), $ace->getMask()));
}
```

We get a fairly straightforward result:

```php
RoleSecurityIdentity(ROLE_GROUP_1) 1
RoleSecurityIdentity(ROLE_GROUP_OWNER_1) 128
UserSecurityIdentity(test@labstep.com, LabStep\UserBundle\Entity\User) 128
```

There is a single user who has owner permissions over the comment object. There's also some group (GROUP_1); its users can view (1), and its owners can own (128) the comment. Let’s confirm that:

```php
$output->writeln((false === $authorizationChecker->isGranted("VIEW", $entity) ? "not granted" : "granted"));
$output->writeln((false === $authorizationChecker->isGranted("OWNER", $entity) ? "not granted" : "granted"));
```

Output

```plaintext
granted
granted
```

Awesome – the user has OWNER (128) permission, so both OWNER and VIEW are granted: duh, of course an owner can view what they own.

Let’s use a standard isGranted implementation to check the roles, like the one from [here](http://stackoverflow.com/questions/24078270/check-if-a-role-is-granted-for-a-specific-user-in-symfony2-acl):

```php
$securityIdentity = new RoleSecurityIdentity(sprintf("ROLE_GROUP_OWNER_%d", 1));
$output->writeln((false === $aclManager->isGranted("VIEW", $entity, $securityIdentity) ? "not granted" : "granted"));
$output->writeln((false === $aclManager->isGranted("OWNER", $entity, $securityIdentity) ? "not granted" : "granted"));
```

Output:

```plaintext
not granted
granted
```

The ROLE_GROUP_OWNER_1 is OWNER of this entity but is not granted VIEW permissions. This is very confusing but nonetheless correct. So, what does the authorizationChecker do under the hood to provide different behavior than the aclManager?

The file

```plaintext
vendor/symfony/symfony/src/Symfony/Component/Security/Acl/Permission/BasicPermissionMap.php
```

Provides a mapping that means an owner permission will be transformed into a mask that includes all the masks below OWNER in the hierarchy.

Here’s an alternative example of `isGranted` that gives a more intuitive behavior:

```php
use Symfony\Component\Security\Acl\Permission\BasicPermissionMap;

public function isGranted($mask, $object, $securityIdentities) {
    $objectIdentity = ObjectIdentity::fromDomainObject($object);

    if (!is_array($securityIdentities)) {
        $securityIdentities = array($securityIdentities);
    }

    try {
        $acl = $this->provider->findAcl($objectIdentity, $securityIdentities);
    } catch (AclNotFoundException $e) {
        return false;
    }

    if (!is_int($mask)) {
        $permissionMap = new BasicPermissionMap();
        $masks = $permissionMap->getMasks($mask, null);
    } else {
        $masks = array($mask);
    }

    try {
        return $acl->isGranted($masks, $securityIdentities, false);
    } catch (NoAceFoundException $e) {
        return false;
    }
}
```

Edits: The title was changed to be more descriptive. Added a missing use statement for the BasicPermissionMap.

