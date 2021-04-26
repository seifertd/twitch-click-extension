function harvest() {
  const foo = () => {
    const myButton = document.querySelector("button.tw-button.tw-button--success");
    if (myButton) {
      console.log("Clicking the button, yo!");
      myButton.click();
    }
    console.log("Resetting auto click handler ...");
    window.harvestTimeout = window.setTimeout(foo, 60000);
  };
  foo();
}

function deharvest() {
  if (window.harvestTimeout) {
    window.clearTimeout(window.harvestTimeout);
    delete window.harvestTimeout;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("I AM RUNNING!");
  chrome.storage.sync.set({ drlupo: 'off' });
});
chrome.action.onClicked.addListener( async (tab) =>{
  console.log("Extension was clicked with tab: ", tab);
  if ( tab.url === 'https://www.twitch.tv/DrLupo' ) {
    chrome.storage.sync.get("drlupo", ({ drlupo }) => {
      console.log("GOT STATE: ", drlupo);
      if ( drlupo === 'off' ) {
        chrome.storage.sync.set({ drlupo: 'on' });
        chrome.action.setBadgeText( { tabId: tab.id, text: 'ON' });
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: harvest
        });
      } else {
        chrome.storage.sync.set({ drlupo: 'off' });
        chrome.action.setBadgeText( { tabId: tab.id, text: 'OFF' });
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: deharvest
        });
      }
    });
  }
});
