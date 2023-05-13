function harvest() {
  const foo = () => {
    const myButton = document.querySelector("button[aria-label='Claim Bonus']")
    if (myButton) {
      myButton.click();
    }
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

function readLocalStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      //console.log(`LOCAL STORAGE GET OF KEY ${key}: `, result);
      resolve(result);
    });
  });
}

function writeLocalStorage(value) {
  //console.log(`WRITING TO LOCAL STORAGE: `, value);
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(value, () => {
      resolve();
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  //console.log("I AM RUNNING!");
  chrome.storage.local.set({ drlupo: {} });
});

chrome.tabs.onRemoved.addListener( async ( tabId, removeInfo ) => {
   const tabConfig = await readLocalStorage("drlupo");
   const { drlupo } = tabConfig;
   //console.log(`TAB IS GOING AWAY: ${tabId}`, tabConfig, drlupo);
   if ( drlupo && drlupo[tabId] ) {
     delete drlupo[tabId];
     writeLocalStorage(tabConfig);
   }
});

chrome.action.onClicked.addListener( async (tab) =>{
  //console.log("GOT CLICK FOR TAB ", tab);
  if ( tab.url === 'https://www.twitch.tv/tsoding' ) {
    const storageKey = `drlupo`;
    const tabConfig = await readLocalStorage(storageKey);
    const { drlupo } = tabConfig;
    //console.log("READ STORAGE: ", tabConfig, drlupo);
    if ( !drlupo[tab.id] ) {
      // initialize storage
      drlupo[tab.id] = 'off';
      await writeLocalStorage(tabConfig);
    }
    const tabState = drlupo[tab.id];
    //console.log("   --> DRLUPO!: ", tabState);
    if ( tabState === 'off' ) {
      drlupo[tab.id] = 'on';
      await writeLocalStorage(tabConfig);
      chrome.action.setBadgeText( { tabId: tab.id, text: 'ON' });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: harvest
      });
    } else {
      drlupo[tab.id] = 'off';
      await writeLocalStorage(tabConfig);
      chrome.action.setBadgeText( { tabId: tab.id, text: 'OFF' });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: deharvest
      });
    }
  }
});
