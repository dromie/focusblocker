chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) { 
  // Move this to the setting page
  chrome.storage.sync.set({"state": "free", "start_time": Date.now()})
  chrome.storage.sync.set({"default_prompt_time":10});
  chrome.storage.sync.set({"block_time":0.2});
  console.log(tab.url)
  /*
  console.log(changeInfo)
  console.log(tab)
  */
  // TODO; make the blacklist customizable
  if (tab.url.includes("facebook.com") && tab.status == "loading"){
    // if state == none
    chrome.storage.sync.get("state", function(items){
      console.log(items)
      if (typeof(items.state) == "undefined" || items.state == "free"){

        chrome.tabs.executeScript(tabId, {file: "data/promptTimedBlock.js"});
      }
        /*
        chrome.tabs.sendMessage(tabId, {default_prompt_time: 10}, function(response) {
          console.log("Got response")
          console.log(response);
        });
        */
        // set countdown state
        // set timer to block
      // if state == countdown
        // if still valid
          // set timer to block
        // if already expired
          // block right away
      // if state == block
        // if still valid
          // block right away
        // if already expired
          // set state to unblock
        //chrome.tabs.executeScript(tabId, {file: "data/block.js"});
        // set timer to none

    })
  }
});

chrome.storage.onChanged.addListener(function(changes, namespace){
  console.log(changes)
  if (changes.state && changes.state.newValue == "countdown"){
    console.log("Set blocking alarm at " + Date(changes.end_time.newValue).toString())
    chrome.alarms.create("block", {"when":changes.end_time.newValue});
  }
  else if (changes.state && changes.state.newValue == "blocking"){
    console.log("Set unblocking alarm at " + Date(changes.end_time.newValue).toString())
    chrome.alarms.create("unblock", {"when":changes.end_time.newValue});
  }
})

chrome.alarms.onAlarm.addListener(function( alarm ) {
  console.log("Got an alarm!", alarm);
  if (alarm.name == "block"){
    block()
    chrome.storage.sync.get("block_time", function(items){
      var time = items.block_time;
      chrome.storage.sync.set({"state": "blocking", 
                               "start_time": Date.now(),
                               "end_time": Date.now() + Math.round(time * 60 * 1000)
                              })
    })
  }

  else if (alarm.name == "unblock"){
    chrome.storage.sync.set({"state": "free", 
                             "start_time": Date.now(),
                             "end_time": undefined
                            })
  }
});

function block() {
  // TODO: dynamic url list
  chrome.tabs.query({"url": ["*://*.facebook.com/*"]}, function(tabs){
    console.log(tabs)
    for (var tab of tabs){
      console.log("blocking tab " + tabs.id)
      chrome.tabs.executeScript(tab.id, {file: "data/block.js"});
    }
  })
  
}
