<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | Mapeamento das chaves de serviços externos consumidos pela aplicação.
    |
    */

    'meta' => [
        'verify_token' => env('META_VERIFY_TOKEN', 'dactyla_starter_token_2026'),
        'app_secret' => env('META_APP_SECRET'),
        'phone_number_id' => env('META_PHONE_NUMBER_ID'),
        'access_token' => env('META_ACCESS_TOKEN'),
    ],

];
