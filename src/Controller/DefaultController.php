<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;

class DefaultController extends Controller{

    public function index(Request $request){
        return $this->render('cube.html.twig');
    }

    public function weather(Request $request){
        if($this->getParameter('weather.provider') == 'forecastio'){
            $API_URL = "{$this->getParameter('weather.api_url')}/%s/%s";
            $API_KEY = $this->getParameter('weather.api_key');

            $LOCATION = $this->getParameter('weather.location');

            $url = sprintf($API_URL, $API_KEY, $LOCATION);

            $cacheTTL = strtotime('-1 hour');
            $cacheRefreshWaitInterval = 0.5;
            $cacheLockMaxWait = 5;

            $cacheFile = sys_get_temp_dir() . '/cube-weather.cache';
            if(file_exists("$cacheFile.lock") && filemtime("$cacheFile.lock") > $cacheLockMaxWait)
                unlink("$cacheFile.lock");

            if(file_exists($cacheFile) && filemtime($cacheFile) > $cacheTTL){
                $weather = file_get_contents($cacheFile);
            }
            else{
                if(!file_exists("$cacheFile.lock")){
                    file_put_contents("$cacheFile.lock", 'locked');

                    $c = curl_init();
                    curl_setopt($c, CURLOPT_URL, $url);
                    curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
                    curl_setopt($c, CURLOPT_CONNECTTIMEOUT, 5);

                    $sContents = curl_exec($c);
                    curl_close($c);

                    $weather = $sContents;

                    file_put_contents($cacheFile, $weather);
                    unlink("$cacheFile.lock");
                }
                else{
                    while(file_exists("$cacheFile.lock")){
                        sleep($cacheRefreshWaitInterval);
                    }

                    $weather = file_get_contents($cacheFile);
                }
            }

            return new Response($weather);
        }
    }
}
