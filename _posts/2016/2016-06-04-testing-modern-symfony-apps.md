---
layout: post
title: "Testing Modern Symfony Apps"
date: '2016-06-04T02:32:00.001-07:00'
author: jandom
tags: []
modified_time: '2016-06-04T03:11:10.852-07:00'
blogger_id: tag:blogger.com,1999:blog-2967594273163880803.post-8950137088843340785
blogger_orig_url: https://jandomanski.blogspot.com/2016/06/testing-modern-symfony-apps.html
---

### Introduction

The words "modern" and "PHP framework" would usually be considered oxymorons – and for good reasons. However, there’s no point in denying that a large number of things on the internet rely on Symfony or some other PHP framework to run. These things will be gradually phased out or upgraded, but for now, they can't just remain untested because they're somewhat (out)dated.

### API Testing

The more rigorous part is RESTful API testing, which involves sending JSON to the server and receiving responses back. Let’s create a boilerplate class to help send POST/GET/DELETE requests wrapped as methods:

```php
<?php  
namespace YourApp\ApiBundle\Tests\Controller;  
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase; 
use Symfony\Component\HttpFoundation\Response;  

class ApiTestCase extends WebTestCase {      
    protected function post($uri, array $data) {         
        $headers = array('CONTENT_TYPE' => 'application/json', "HTTP_APIKEY" => $this->apikey);         
        $content = json_encode($data);         
        $client = static::createClient();         
        $client->request('POST', $uri, array(), array(), $headers, $content);          

        return $client->getResponse();     
    }      

    protected function get($uri) {         
        $headers = array('CONTENT_TYPE' => 'application/json', "HTTP_APIKEY" => $this->apikey);         
        $client = static::createClient();         
        $client->request('GET', $uri, array(), array(), $headers);          

        return $client->getResponse();     
    }      

    protected function delete($uri) {         
        $headers = array('CONTENT_TYPE' => 'application/json', "HTTP_APIKEY" => $this->apikey);         
        $client = static::createClient();         
        $client->request('DELETE', $uri, array(), array(), $headers);          

        return $client->getResponse();     
    }  
}
```

Now, let's use this ancestor class to facilitate real-life testing of user profile reads and updates:


```php
<?php  
namespace YourApp\ApiBundle\Tests\Controller;  
use Symfony\Component\HttpFoundation\Response;

class UserControllerTest extends ApiTestCase {      
    protected $apikey = "YourLongAndComplicatedAPIKey";      

    public function testUpdateUserProfile() {          
        $form = ['user' => ['name' => 'John Smith', 'profile' => ['location' => '', 'research_interests' => '', 'organisation' => '', 'publications' => '']]];          
        $response = $this->post('/api/users/1.json', $form);         
        $content = $response->getContent();          

        $this->assertSame(Response::HTTP_CREATED, $response->getStatusCode());          
        $object = json_decode($content);         
        $this->assertEquals($object->success, true);     
    }

    public function testUpdateUserProfileIncompleted() {          
        $form = ['user' => ['name' => 'John Smith']];          
        $response = $this->post('/api/users/1.json', $form);         
        $content = $response->getContent();          

        $this->assertSame(Response::HTTP_CREATED, $response->getStatusCode());          
        $object = json_decode($content);         
        $this->assertEquals($object->success, true);     
    }      

    public function testUpdateUserProfileInvalid() {          
        $form = ['user' => ['nameeee' => 'John Smith']];          
        $response = $this->post('/api/users/1.json', $form);         
        $content = $response->getContent();          

        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode());         
        $object = json_decode($content);          
        $this->assertEquals($object->errors->errors[0], "This form should not contain extra fields.");     
    }  
}
```

To run the tests, use the following command:


```bash
phpunit -c app src/YourApp/ApiBundle/Tests/Controller/
```

**Frontend Functional/Flow Testing**

While valuable, API testing won’t cover certain aspects of the application flow. For example, you may change a <script> dependency version loaded from a CDN. Your API works fine, but your JS code might break for some reason (this happened to us with react-bootstrap, which deprecated the ModalTrigger component at some point).

Here’s a simple test using mocha.js and zombie.js to log the user in and check if content pages load. No interaction, just "does it load?":

```js
var expect = require('expect.js'), Browser = require('zombie');

describe('quick', function() {      
    const browser = new Browser({site: "http://127.0.0.1:8000/app_dev.php"});     
    const user = { username: "test@yourapp.com", password: "SomePassword" }

    describe('login as user', function() {       
        before(function(done) {           
            browser.visit('/login', done);       
        });        

        it('should show login form', function() {           
            browser.assert.success();           
            browser.assert.text('title', 'Log In');       
        });        

        it('should login with correct credentials', function(done) {           
            browser.fill('_username', user.username);           
            browser.fill('_password', user.password);           
            browser.pressButton('Login').then(function() {               
                expect(browser.text("title")).to.equal('Labstep – legitimate and replicable protocols');               
                expect(browser.text("ul.authenticated")).to.contain('Welcome to Labstep');               
                expect(browser.text("h2.special")).to.contain('Experimental timeline');           
            }).then(done, done);       
        });     
    });

    describe('visit /home', function() {       
        before(function(done) {           
            browser.visit('/home', done);       
        });        

        it('should show the create post button', function() {           
            browser.assert.success();           
            expect(browser.text("button")).to.contain('Create a Timeline Post');       
        });     
    });

    describe('visit /protocols', function() {       
        before(function(done) {           
            browser.visit('/protocols', done);       
        });        

        it('should show a group in protocol discovery', function() {           
            browser.assert.success();           
            expect(browser.text("span")).to.contain('Wiley Group');       
        });     
    });

    describe('visit /group/1', function() {       
        before(function(done) {           
            browser.visit('/group/1', done);       
        });        

        it('should show an example protocol', function() {           
            browser.assert.success();           
            expect(browser.text("a")).to.contain('Qiagen minipreptest');       
        });     
    });
});
```

To run the test, use:

```bash
mocha tests/functional/quick/quick.js
```