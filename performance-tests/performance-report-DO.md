# Batch Stress Test Report
**Date:** 2025-11-30T16:23:46.250Z
**Configuration:**
- Backend: https://prod-backend-dnd.notshige.me
- Game Server: https://prod-game-dnd.notshige.me
- **Max Stable Concurrent Users:** 33

## Batch Progression
| Batch Size | Success | Failed | Max Latency (ms) | Status |
|------------|---------|--------|------------------|--------|
| 1 | 1 | 0 | 494 | PASS |
| 2 | 2 | 0 | 340 | PASS |
| 3 | 3 | 0 | 337 | PASS |
| 4 | 4 | 0 | 524 | PASS |
| 5 | 5 | 0 | 390 | PASS |
| 6 | 6 | 0 | 569 | PASS |
| 7 | 7 | 0 | 549 | PASS |
| 8 | 8 | 0 | 601 | PASS |
| 9 | 9 | 0 | 794 | PASS |
| 10 | 10 | 0 | 794 | PASS |
| 11 | 11 | 0 | 1024 | PASS |
| 12 | 12 | 0 | 1140 | PASS |
| 13 | 13 | 0 | 853 | PASS |
| 14 | 14 | 0 | 1111 | PASS |
| 15 | 15 | 0 | 1107 | PASS |
| 16 | 16 | 0 | 1075 | PASS |
| 17 | 17 | 0 | 1374 | PASS |
| 18 | 18 | 0 | 1852 | PASS |
| 19 | 19 | 0 | 1942 | PASS |
| 20 | 20 | 0 | 2116 | PASS |
| 21 | 21 | 0 | 1581 | PASS |
| 22 | 22 | 0 | 2055 | PASS |
| 23 | 23 | 0 | 1684 | PASS |
| 24 | 24 | 0 | 1740 | PASS |
| 25 | 25 | 0 | 1677 | PASS |
| 26 | 26 | 0 | 1717 | PASS |
| 27 | 27 | 0 | 1778 | PASS |
| 28 | 28 | 0 | 2808 | PASS |
| 29 | 29 | 0 | 2630 | PASS |
| 30 | 30 | 0 | 2481 | PASS |
| 31 | 31 | 0 | 2394 | PASS |
| 32 | 32 | 0 | 4003 | PASS |
| 33 | 33 | 0 | 2945 | PASS |
| 34 | 32 | 2 | 3514 | FAIL |

## Detailed Metrics (Last Batch)
**Batch Size:** 34

| User | Register | Login | Profile | Lobby | Socket | Update | Search | Total |
|------|----------|-------|---------|-------|--------|--------|--------|-------|
| 0 | 574 | 1836 | 505 | 155 | 257 | 761 | 151 | 4239 |
| 1 | 1479 | 2128 | 382 | 737 | 227 | 279 | 145 | 5378 |
| 2 | 1862 | 2087 | 235 | 405 | 339 | 238 | 268 | 5434 |
| 3 | 2067 | 1893 | 245 | 667 | 229 | 210 | 93 | 5404 |
| 4 | 1170 | 2041 | 642 | 354 | 645 | 90 | 181 | 5123 |
| 5 | 536 | 1473 | 158 | 160 | 262 | 1281 | 252 | 4122 |
| 6 | 700 | 1682 | 464 | 165 | 263 | 794 | 162 | 4230 |
| 7 | 1400 | 2005 | 547 | 475 | 479 | 193 | 136 | 5235 |
| 8 | 343 | 381 | 96 | 357 | 263 | 273 | 98 | 1811 |
| 9 | 1698 | 2202 | 226 | 457 | 334 | 192 | 162 | 5271 |
| 10 | 1289 | 2313 | 380 | 323 | 594 | 157 | 255 | 5311 |
| 11 | 582 | 1691 | 315 | 157 | 263 | 1063 | 155 | 4226 |
| 12 | 422 | 443 | 115 | 259 | 220 | 297 | 236 | 1992 |
| 13 | 1740 | 2063 | 311 | - | - | - | - | 4277 |
| 14 | 1292 | 2391 | 332 | - | - | - | - | 4318 |
| 15 | 1662 | 2020 | 332 | 582 | 331 | 245 | 137 | 5309 |
| 16 | 1156 | 2496 | 346 | 410 | 531 | 278 | 159 | 5376 |
| 17 | 802 | 2419 | 553 | 338 | 600 | 209 | 129 | 5050 |
| 18 | 1717 | 2075 | 282 | 720 | 230 | 258 | 106 | 5388 |
| 19 | 1397 | 1945 | 470 | 295 | 609 | 114 | 76 | 4906 |
| 20 | 1096 | 1763 | 902 | 146 | 634 | 97 | 75 | 4713 |
| 21 | 3475 | 611 | 155 | 669 | 274 | 196 | 91 | 5471 |
| 22 | 1570 | 2227 | 311 | 474 | 365 | 286 | 147 | 5380 |
| 23 | 773 | 2381 | 669 | 160 | 602 | 124 | 79 | 4788 |
| 24 | 3514 | 662 | 100 | 433 | 214 | 237 | 269 | 5429 |
| 25 | 726 | 2105 | 834 | 148 | 510 | 98 | 72 | 4494 |
| 26 | 1879 | 2000 | 251 | 658 | 226 | 249 | 123 | 5386 |
| 27 | 958 | 1531 | 686 | 163 | 225 | 739 | 88 | 4390 |
| 28 | 1400 | 2235 | 356 | 840 | 237 | 361 | 78 | 5507 |
| 29 | 1820 | 2045 | 264 | 597 | 221 | 265 | 129 | 5341 |
| 30 | 1500 | 2290 | 300 | 421 | 399 | 197 | 157 | 5264 |
| 31 | 1034 | 1534 | 897 | 165 | 221 | 350 | 88 | 4289 |
| 32 | 1922 | 2177 | 154 | 392 | 283 | 317 | 133 | 5378 |
| 33 | 1775 | 2230 | 225 | 496 | 220 | 270 | 156 | 5372 |

## Errors (Last Batch)
- User 13: Create Lobby: Request failed with status code 502 (Status: 502) Data: <!DOCTYPE html>
<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]-->
<!--[if IE 7]>    <html class="no-js ie7 oldie" lang="en-US"> <![endif]-->
<!--[if IE 8]>    <html class="no-js ie8 oldie" lang="en-US"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="en-US"> <!--<![endif]-->
<head>

<title>notshige.me | 502: Bad gateway</title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
<meta name="robots" content="noindex, nofollow" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="stylesheet" id="cf_styles-css" href="/cdn-cgi/styles/main.css" />
</head>
<body>
<div id="cf-wrapper">
    <div id="cf-error-details" class="p-0">
        <header class="mx-auto pt-10 lg:pt-6 lg:px-8 w-240 lg:w-full mb-8">
            <h1 class="inline-block sm:block sm:mb-2 font-light text-60 lg:text-4xl text-black-dark leading-tight mr-2">
                <span class="inline-block">Bad gateway</span>
                <span class="code-label">Error code 502</span>
            </h1>
            <div>
                Visit <a href="https://www.cloudflare.com/5xx-error-landing?utm_source=errorcode_502&utm_campaign=prod-game-dnd.notshige.me" target="_blank" rel="noopener noreferrer">cloudflare.com</a> for more information.
            </div>
            <div class="mt-3">2025-11-30 16:24:06 UTC</div>
        </header>
        <div class="my-8 bg-gradient-gray">
            <div class="w-240 lg:w-full mx-auto">
                <div class="clearfix md:px-8">
                    <div id="cf-browser-status" class=" relative w-1/3 md:w-full py-15 md:p-0 md:py-8 md:text-left md:border-solid md:border-0 md:border-b md:border-gray-400 overflow-hidden float-left md:float-none text-center">
  <div class="relative mb-10 md:m-0">
    
    <span class="cf-icon-browser block md:hidden h-20 bg-center bg-no-repeat"></span>
    <span class="cf-icon-ok w-12 h-12 absolute left-1/2 md:left-auto md:right-0 md:top-0 -ml-6 -bottom-4"></span>
    
  </div>
  <span class="md:block w-full truncate">You</span>
  <h3 class="md:inline-block mt-3 md:mt-0 text-2xl text-gray-600 font-light leading-1.3">
  
    Browser
  
  </h3>
  
  <span class="leading-1.3 text-2xl text-green-success">Working</span>
  
</div>
                    <div id="cf-cloudflare-status" class=" relative w-1/3 md:w-full py-15 md:p-0 md:py-8 md:text-left md:border-solid md:border-0 md:border-b md:border-gray-400 overflow-hidden float-left md:float-none text-center">
  <div class="relative mb-10 md:m-0">
    <a href="https://www.cloudflare.com/5xx-error-landing?utm_source=errorcode_502&#38;utm_campaign=prod-game-dnd.notshige.me" target="_blank" rel="noopener noreferrer">
    <span class="cf-icon-cloud block md:hidden h-20 bg-center bg-no-repeat"></span>
    <span class="cf-icon-ok w-12 h-12 absolute left-1/2 md:left-auto md:right-0 md:top-0 -ml-6 -bottom-4"></span>
    </a>
  </div>
  <span class="md:block w-full truncate">Singapore</span>
  <h3 class="md:inline-block mt-3 md:mt-0 text-2xl text-gray-600 font-light leading-1.3">
  <a href="https://www.cloudflare.com/5xx-error-landing?utm_source=errorcode_502&utm_campaign=prod-game-dnd.notshige.me" target="_blank" rel="noopener noreferrer">
    Cloudflare
  </a>
  </h3>
  
  <span class="leading-1.3 text-2xl text-green-success">Working</span>
  
</div>
                    <div id="cf-host-status" class="cf-error-source relative w-1/3 md:w-full py-15 md:p-0 md:py-8 md:text-left md:border-solid md:border-0 md:border-b md:border-gray-400 overflow-hidden float-left md:float-none text-center">
  <div class="relative mb-10 md:m-0">
    
    <span class="cf-icon-server block md:hidden h-20 bg-center bg-no-repeat"></span>
    <span class="cf-icon-error w-12 h-12 absolute left-1/2 md:left-auto md:right-0 md:top-0 -ml-6 -bottom-4"></span>
    
  </div>
  <span class="md:block w-full truncate">prod-game-dnd.notshige.me</span>
  <h3 class="md:inline-block mt-3 md:mt-0 text-2xl text-gray-600 font-light leading-1.3">
  
    Host
  
  </h3>
  
  <span class="leading-1.3 text-2xl text-red-error">Error</span>
  
</div>
                </div>
            </div>
        </div>

        <div class="w-240 lg:w-full mx-auto mb-8 lg:px-8">
            <div class="clearfix">
                <div class="w-1/2 md:w-full float-left pr-6 md:pb-10 md:pr-0 leading-relaxed">
                    <h2 class="text-3xl font-normal leading-1.3 mb-4">What happened?</h2>
                    <p>The web server reported a bad gateway error.</p>
                </div>
                <div class="w-1/2 md:w-full float-left leading-relaxed">
                    <h2 class="text-3xl font-normal leading-1.3 mb-4">What can I do?</h2>
                    <p class="mb-6">Please try again in a few minutes.</p>
                </div>
            </div>
        </div>

        <div class="cf-error-footer cf-wrapper w-240 lg:w-full py-10 sm:py-4 sm:px-8 mx-auto text-center sm:text-left border-solid border-0 border-t border-gray-300">
    <p class="text-13">
      <span class="cf-footer-item sm:block sm:mb-1">Cloudflare Ray ID: <strong class="font-semibold">9a6bb1727dfdfdb0</strong></span>
      <span class="cf-footer-separator sm:hidden">&bull;</span>
      <span id="cf-footer-item-ip" class="cf-footer-item hidden sm:block sm:mb-1">
        Your IP:
        <button type="button" id="cf-footer-ip-reveal" class="cf-footer-ip-reveal-btn">Click to reveal</button>
        <span class="hidden" id="cf-footer-ip">2a09:bac5:4ff0:25c3::3c3:3c</span>
        <span class="cf-footer-separator sm:hidden">&bull;</span>
      </span>
      <span class="cf-footer-item sm:block sm:mb-1"><span>Performance &amp; security by</span> <a rel="noopener noreferrer" href="https://www.cloudflare.com/5xx-error-landing?utm_source=errorcode_502&#38;utm_campaign=prod-game-dnd.notshige.me" id="brand_link" target="_blank">Cloudflare</a></span>
      
    </p>
    <script>(function(){function d(){var b=a.getElementById("cf-footer-item-ip"),c=a.getElementById("cf-footer-ip-reveal");b&&"classList"in b&&(b.classList.remove("hidden"),c.addEventListener("click",function(){c.classList.add("hidden");a.getElementById("cf-footer-ip").classList.remove("hidden")}))}var a=document;document.addEventListener&&a.addEventListener("DOMContentLoaded",d)})();</script>
  </div><!-- /.error-footer -->

    </div>
</div>
</body>
</html>
- User 14: Create Lobby: Request failed with status code 502 (Status: 502) Data: <!DOCTYPE html>
<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]-->
<!--[if IE 7]>    <html class="no-js ie7 oldie" lang="en-US"> <![endif]-->
<!--[if IE 8]>    <html class="no-js ie8 oldie" lang="en-US"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="en-US"> <!--<![endif]-->
<head>

<title>notshige.me | 502: Bad gateway</title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
<meta name="robots" content="noindex, nofollow" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="stylesheet" id="cf_styles-css" href="/cdn-cgi/styles/main.css" />
</head>
<body>
<div id="cf-wrapper">
    <div id="cf-error-details" class="p-0">
        <header class="mx-auto pt-10 lg:pt-6 lg:px-8 w-240 lg:w-full mb-8">
            <h1 class="inline-block sm:block sm:mb-2 font-light text-60 lg:text-4xl text-black-dark leading-tight mr-2">
                <span class="inline-block">Bad gateway</span>
                <span class="code-label">Error code 502</span>
            </h1>
            <div>
                Visit <a href="https://www.cloudflare.com/5xx-error-landing?utm_source=errorcode_502&utm_campaign=prod-game-dnd.notshige.me" target="_blank" rel="noopener noreferrer">cloudflare.com</a> for more information.
            </div>
            <div class="mt-3">2025-11-30 16:24:06 UTC</div>
        </header>
        <div class="my-8 bg-gradient-gray">
            <div class="w-240 lg:w-full mx-auto">
                <div class="clearfix md:px-8">
                    <div id="cf-browser-status" class=" relative w-1/3 md:w-full py-15 md:p-0 md:py-8 md:text-left md:border-solid md:border-0 md:border-b md:border-gray-400 overflow-hidden float-left md:float-none text-center">
  <div class="relative mb-10 md:m-0">
    
    <span class="cf-icon-browser block md:hidden h-20 bg-center bg-no-repeat"></span>
    <span class="cf-icon-ok w-12 h-12 absolute left-1/2 md:left-auto md:right-0 md:top-0 -ml-6 -bottom-4"></span>
    
  </div>
  <span class="md:block w-full truncate">You</span>
  <h3 class="md:inline-block mt-3 md:mt-0 text-2xl text-gray-600 font-light leading-1.3">
  
    Browser
  
  </h3>
  
  <span class="leading-1.3 text-2xl text-green-success">Working</span>
  
</div>
                    <div id="cf-cloudflare-status" class=" relative w-1/3 md:w-full py-15 md:p-0 md:py-8 md:text-left md:border-solid md:border-0 md:border-b md:border-gray-400 overflow-hidden float-left md:float-none text-center">
  <div class="relative mb-10 md:m-0">
    <a href="https://www.cloudflare.com/5xx-error-landing?utm_source=errorcode_502&#38;utm_campaign=prod-game-dnd.notshige.me" target="_blank" rel="noopener noreferrer">
    <span class="cf-icon-cloud block md:hidden h-20 bg-center bg-no-repeat"></span>
    <span class="cf-icon-ok w-12 h-12 absolute left-1/2 md:left-auto md:right-0 md:top-0 -ml-6 -bottom-4"></span>
    </a>
  </div>
  <span class="md:block w-full truncate">Singapore</span>
  <h3 class="md:inline-block mt-3 md:mt-0 text-2xl text-gray-600 font-light leading-1.3">
  <a href="https://www.cloudflare.com/5xx-error-landing?utm_source=errorcode_502&utm_campaign=prod-game-dnd.notshige.me" target="_blank" rel="noopener noreferrer">
    Cloudflare
  </a>
  </h3>
  
  <span class="leading-1.3 text-2xl text-green-success">Working</span>
  
</div>
                    <div id="cf-host-status" class="cf-error-source relative w-1/3 md:w-full py-15 md:p-0 md:py-8 md:text-left md:border-solid md:border-0 md:border-b md:border-gray-400 overflow-hidden float-left md:float-none text-center">
  <div class="relative mb-10 md:m-0">
    
    <span class="cf-icon-server block md:hidden h-20 bg-center bg-no-repeat"></span>
    <span class="cf-icon-error w-12 h-12 absolute left-1/2 md:left-auto md:right-0 md:top-0 -ml-6 -bottom-4"></span>
    
  </div>
  <span class="md:block w-full truncate">prod-game-dnd.notshige.me</span>
  <h3 class="md:inline-block mt-3 md:mt-0 text-2xl text-gray-600 font-light leading-1.3">
  
    Host
  
  </h3>
  
  <span class="leading-1.3 text-2xl text-red-error">Error</span>
  
</div>
                </div>
            </div>
        </div>

        <div class="w-240 lg:w-full mx-auto mb-8 lg:px-8">
            <div class="clearfix">
                <div class="w-1/2 md:w-full float-left pr-6 md:pb-10 md:pr-0 leading-relaxed">
                    <h2 class="text-3xl font-normal leading-1.3 mb-4">What happened?</h2>
                    <p>The web server reported a bad gateway error.</p>
                </div>
                <div class="w-1/2 md:w-full float-left leading-relaxed">
                    <h2 class="text-3xl font-normal leading-1.3 mb-4">What can I do?</h2>
                    <p class="mb-6">Please try again in a few minutes.</p>
                </div>
            </div>
        </div>

        <div class="cf-error-footer cf-wrapper w-240 lg:w-full py-10 sm:py-4 sm:px-8 mx-auto text-center sm:text-left border-solid border-0 border-t border-gray-300">
    <p class="text-13">
      <span class="cf-footer-item sm:block sm:mb-1">Cloudflare Ray ID: <strong class="font-semibold">9a6bb1727dfbfdb0</strong></span>
      <span class="cf-footer-separator sm:hidden">&bull;</span>
      <span id="cf-footer-item-ip" class="cf-footer-item hidden sm:block sm:mb-1">
        Your IP:
        <button type="button" id="cf-footer-ip-reveal" class="cf-footer-ip-reveal-btn">Click to reveal</button>
        <span class="hidden" id="cf-footer-ip">2a09:bac5:4ff0:25c3::3c3:3c</span>
        <span class="cf-footer-separator sm:hidden">&bull;</span>
      </span>
      <span class="cf-footer-item sm:block sm:mb-1"><span>Performance &amp; security by</span> <a rel="noopener noreferrer" href="https://www.cloudflare.com/5xx-error-landing?utm_source=errorcode_502&#38;utm_campaign=prod-game-dnd.notshige.me" id="brand_link" target="_blank">Cloudflare</a></span>
      
    </p>
    <script>(function(){function d(){var b=a.getElementById("cf-footer-item-ip"),c=a.getElementById("cf-footer-ip-reveal");b&&"classList"in b&&(b.classList.remove("hidden"),c.addEventListener("click",function(){c.classList.add("hidden");a.getElementById("cf-footer-ip").classList.remove("hidden")}))}var a=document;document.addEventListener&&a.addEventListener("DOMContentLoaded",d)})();</script>
  </div><!-- /.error-footer -->

    </div>
</div>
</body>
</html>