package com.company.project.StudentAPI.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HelloController {
    // GET /hello
    @GetMapping("/hello")
    public String hello() {
        return "Hello Spring Boot";
    }

    // POST /echo
    @PostMapping("/echo")
    public String echo(@RequestBody Map<String, Object> body) {
        return body.toString();
    }

    // GET /sum
    @GetMapping("/sum")
    public String sum(@RequestParam int a, @RequestParam int b) {
        int result = a + b;
        return "Result: " + a + " + " + b  + " = " + result;
    }

}
