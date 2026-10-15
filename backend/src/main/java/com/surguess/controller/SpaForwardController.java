package com.surguess.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Forwards Single Page Application (SPA) client-side routes to index.html
 * so direct browser refreshes and deep links don't result in HTTP 404.
 */
@Controller
public class SpaForwardController {

    @RequestMapping(value = {
            "/progressive",
            "/quiz",
            "/duo",
            "/multiplayer",
            "/daily",
            "/decades",
            "/artists",
            "/trivia",
            "/admin"
    })
    public String forwardToSpaIndex() {
        return "forward:/index.html";
    }
}
