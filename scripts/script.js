// Ad unit configuration
var adUnits = [
  {
    code: "ad-slot-1",
    mediaTypes: {
      banner: {
        sizes: [
          [300, 250],
          [728, 90],
        ],
      },
    },
    bids: [
      { bidder: "appnexus", params: { placementId: 12345 } },
      {
        bidder: "rubicon",
        params: { accountId: 7890, siteId: 5678, zoneId: 1234 },
      },
    ],
  },
  {
    code: "ad-slot-2",
    mediaTypes: {
      banner: {
        sizes: [
          [320, 50],
          [300, 250],
        ],
      },
    },
    bids: [
      { bidder: "appnexus", params: { placementId: 67890 } },
      {
        bidder: "rubicon",
        params: { accountId: 7890, siteId: 5678, zoneId: 5678 },
      },
    ],
  },
];

// Initialize Prebid.js
var pbjs = pbjs || {};
pbjs.que = pbjs.que || [];

// Google Publisher Tag (GPT) setup
window.googletag = window.googletag || { cmd: [] };

googletag.cmd.push(function () {
  // Define ad slots
  googletag
    .defineSlot(
      "/12345678/ad-slot-1",
      [
        [728, 90],
        [300, 250],
      ],
      "ad-slot-1"
    )
    .addService(googletag.pubads());
  googletag
    .defineSlot(
      "/12345678/ad-slot-2",
      [
        [320, 50],
        [300, 250],
      ],
      "ad-slot-2"
    )
    .addService(googletag.pubads());

  // Enable single request mode and lazy-loading
  googletag.pubads().enableSingleRequest();
  googletag.pubads().enableLazyLoad({
    fetchMarginPercent: 200,
    renderMarginPercent: 50,
    mobileScaling: 2.0,
  });
  googletag.enableServices();
});

// Add ad units to Prebid.js and request bids
pbjs.que.push(function () {
  pbjs.addAdUnits(adUnits);

  pbjs.requestBids({
    bidsBackHandler: function () {
      pbjs.setTargetingForGPTAsync();
      googletag.pubads().refresh();
    },
    timeout: 1000,
  });
});

// Track bids and errors
pbjs.que.push(function () {
  pbjs.onEvent("bidResponse", function (bid) {
    console.log("Bid received:", bid);
  });

  pbjs.onEvent("bidTimeout", function (bidders) {
    console.warn("Bid timeout for bidders:", bidders);
  });

  pbjs.onEvent("auctionEnd", function () {
    const noBids = pbjs.getNoBids();
    if (noBids.length > 0) {
      console.warn("No bids for the following ad units:", noBids);
    }
  });

  pbjs.onEvent("bidWon", function (bid) {
    console.log("Winning bid:", bid);
  });
});

// Lazy load ads with IntersectionObserver
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const adUnitCode = entry.target.id;
      pbjs.que.push(() => {
        pbjs.requestBids({
          adUnitCodes: [adUnitCode],
          bidsBackHandler: () => {
            pbjs.setTargetingForGPTAsync();
            googletag
              .pubads()
              .refresh([googletag.slotManager.getSlotById(adUnitCode)]);
          },
        });
      });
      observer.unobserve(entry.target);
    }
  });
});

document
  .querySelectorAll(".ad-slot")
  .forEach((adSlot) => observer.observe(adSlot));

// Fallback ad logic
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    const slots = ["ad-slot-1", "ad-slot-2"];
    slots.forEach((slot) => {
      const highestBid = pbjs.getHighestCpmBids(slot);
      if (!highestBid.length) {
        console.warn(`No winning bid for ${slot}, showing fallback ad.`);
        document.getElementById(slot).innerHTML =
          '<img src="fallback.png" alt="Fallback Ad">';
      }
    });
  }, 1500);
});
