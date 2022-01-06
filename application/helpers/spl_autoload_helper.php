<?php
/**
 *  autoload libraries
 */

function myClassLoader($name)
{
    $path = APPPATH . '/libraries/' . str_replace('_', '/', $name) . '.php';
    if (file_exists($path)) {
        require_once($path);
    }
}

spl_autoload_register('myClassLoader');
