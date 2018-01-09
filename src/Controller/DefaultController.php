<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller{

    /**
     *  @Route("/", name="cube")
     */
    public function index(Request $request){
        return $this->render('cube.html.twig');
    }
}
