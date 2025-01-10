# Prebid.js Header Bidding System

## Overview
This project implements a header bidding system using [Prebid.js](https://prebid.org/) to optimize ad revenue for a publisher's website. The setup integrates real SSPs (Supply-Side Platforms) such as AppNexus and Rubicon Project, along with Google Publisher Tags (GPT) for ad serving.

## Features
- Integration with Prebid.js for header bidding.
- Configuration for AppNexus and Rubicon SSPs.
- Dynamic ad unit configuration for responsive banner ads.
- Lazy loading of ads for improved performance.
- Google Publisher Tags (GPT) for ad delivery.
- Automated deployment using GitHub Actions.

## Prerequisites
1. A web server to host the website.
3. Basic knowledge of SSH for deployment.
4. Active accounts with AppNexus and Rubicon SSPs.

## Setup Instructions

### 1. Prebid.js Integration
1. **Include Prebid.js in your project:**
   Download or link to the Prebid.js library in your HTML file.
   Already incliuded in this repo

   ```html
   <script src="scripts/prebid9.26.0.js"></script>
   ```

2. **Configure Ad Units:**
   Define your ad units and bidders in the JavaScript file. This project uses AppNexus and Rubicon as SSPs.

   Example:
   ```javascript
   var adUnits = [
     {
       code: 'ad-slot-1',
       mediaTypes: {
         banner: { sizes: [[300, 250], [728, 90]] },
       },
       bids: [
         {
           bidder: 'appnexus',
           params: {
             placementId: '123456',
           },
         },
         {
           bidder: 'rubicon',
           params: {
             accountId: '7890',
             siteId: '56789',
             zoneId: '23456',
           },
         },
       ],
     },
   ];
   ```

3. **Request Bids:**
   Configure Prebid.js to request bids from the SSPs and set targeting for ad delivery.

   ```javascript
   pbjs.addAdUnits(adUnits);
   pbjs.requestBids({
     bidsBackHandler: function () {
       pbjs.setTargetingForGPTAsync();
     },
   });
   ```

### 2. Google Publisher Tags (GPT) Setup
1. Include the GPT library in your HTML:
   ```html
   <script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
   ```

2. Define ad slots and enable services:
   ```javascript
   googletag.cmd.push(function () {
     googletag.defineSlot('/12345678/ad-slot-1', [[300, 250], [728, 90]], 'ad-slot-1').addService(googletag.pubads());
     googletag.pubads().enableSingleRequest();
     googletag.pubads().collapseEmptyDivs();
     googletag.enableServices();
   });
   ```

### 3. Lazy Loading Ads
Configure lazy loading to improve performance by only loading ads when they are in the viewport.

```javascript
window.addEventListener('scroll', function () {
  var slots = document.querySelectorAll('[id^="ad-slot-"]');
  slots.forEach(function (slot) {
    var rect = slot.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
      googletag.cmd.push(function () {
        googletag.display(slot.id);
      });
    }
  });
});
```

### 4. Deployment Setup

#### **GitHub Actions Workflow**
Automate deployment with a workflow that SSHs into your server and runs `git pull origin main`.

1. Create a workflow file at `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to Server

   on:
     push:
       branches:
         - main

   jobs:
     deploy:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout Repository
           uses: actions/checkout@v3

         - name: Deploy Application
           uses: appleboy/ssh-action@v0.1.3
           with:
             host: ${{ secrets.SERVER_HOST }}
             username: ${{ secrets.SERVER_USER }}
             key: ${{ secrets.SSH_PRIVATE_KEY }}
             script: |
               cd /path/to/your/project
               git pull origin main
   ```

2. Add secrets to your repository under **Settings** → **Secrets and variables** → **Actions**:
   - `SERVER_HOST`: Your server's IP or hostname.
   - `SERVER_USER`: The username for SSH.
   - `SSH_PRIVATE_KEY`: The private SSH key for your server.

### 5. Testing
- Enable Prebid.js debug mode for detailed logs:
  ```javascript
  pbjs.setConfig({ debug: true });
  ```
- Verify bid requests and responses in the browser developer console.

### Tools Used
- **Prebid.js**: Open-source header bidding library.
- **AppNexus**: Real SSP for header bidding.
- **Rubicon Project**: Another real SSP for header bidding.
- **Google Publisher Tags (GPT)**: For ad serving and integration with Prebid.js.
- **GitHub Actions**: CI/CD automation for deployment.

## Notes
- Ensure you have active accounts with AppNexus and Rubicon to use their services.
- Secure SSH access for deployments and setup up your github variables.
- Test thoroughly before moving to production.
