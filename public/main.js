const goToTestPageButton = document.getElementById('goToTestPage');
const goToProfilePageButton = document.getElementById('goToProfilePage');

// These check to see if each button exists on the current page and to add the event listeners accordingly
if (goToTestPageButton) {
  goToTestPageButton.addEventListener('click', function() {
    window.location.href = '/test';
  });
}

if (goToProfilePageButton) {
  goToProfilePageButton.addEventListener('click', function() {
    window.location.href = '/profile';
  });
}











  
  // Listens to the "Test Your Privacy Knowledge" button click
  const testButton = document.getElementById('testButton');
  if (testButton) {
      testButton.addEventListener('click', function () {
          fetch('/test', { method: 'GET' })
              .then(response => response.json())
              .then(data => {
                  if (data.message) {
                      const profileContainer = document.querySelector('.profile-container');
                      profileContainer.innerHTML = `<h2>${data.message}</h2>`;
                  } else {
                      console.error("Unexpected response format:", data);
                  }
              })
              .catch(error => console.error("Error fetching /test:", error));
      });
  }

  // Listens to the "Redo Test" button click (if thhe testResult exists)
  const redoTestButton = document.getElementById('redoTestButton');
  if (redoTestButton) {
      redoTestButton.addEventListener('click', function () {
          fetch('/redoTest', { method: 'GET' })
              .then(response => response.json())
              .then(data => {
                  if (data.message) {
                      const profileContainer = document.querySelector('.profile-container');
                      profileContainer.innerHTML = `<h2>${data.message}</h2>`;
                  } else {
                      console.error("Unexpected response format:", data);
                  }
              })
              .catch(error => console.error("Error fetching /redoTest:", error));
      });
  }

  // Listens to form submission to delete test results
  const deleteTestForm = document.getElementById('deleteTestForm');
  if (deleteTestForm) {
      deleteTestForm.addEventListener('submit', function (event) {

          fetch('/deleteTest', { method: 'POST' })
              .then(response => response.json())
              .then(data => {
                  if (data.success) {
                      const profileContainer = document.querySelector('.profile-container');
                      profileContainer.innerHTML = `<h2>${data.message}</h2>`;
                  } else {
                      console.error("Failed to delete test results.");
                  }
              })
              .catch(error => console.error("Error fetching /deleteTest:", error));
      });
  }












  let sources = [];  // This will store the fetched sources

  ///// You're interacting with thw API and making that initial request
  document.getElementById('checkEmailInput').addEventListener('click', checkEmailUsername)

  async function checkEmailUsername() {
    console.log("Email checker button works!");
    
    const input = document.getElementById('emailChecker').value;
    console.log(input);
  
    const url = `https://cors-anywhere.herokuapp.com/https://leakcheck.net/api/public?check=${input}`;
    console.log(url);
  
    try {
      const response = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest', 'Origin': window.location.origin } });
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      const sources = data.sources;
      
      // Display the sources
      console.log(sources);
      
      // Send the scan data to the server to store it
      await saveScan(input, sources);

      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  //////// Saving the scan
  async function saveScan(query, sources) {
    console.log('Saving scan with sources:', sources);

    try {
        // Send the new scan to the server
        const response = await fetch('/save-scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, sources }),
        });

        const result = await response.json();
        console.log(result.message); // This will display a success or error message

        // Fetch the updated scan history from the server
        const historyResponse = await fetch('/scan-history');
        if (!historyResponse.ok) throw new Error('Failed to load scan history');

        const scans = await historyResponse.json();

        console.log('Updated scan history:', scans);

        // Update the UI with the new scan history
        updateScanHistoryUI(scans);
    } catch (error) {
        console.error('Error saving scan:', error);
    }
}

  


function updateScanHistoryUI(scans) {
  const historyDiv = document.getElementById('scan-history');
  historyDiv.innerHTML = ''; // Clear the previous history

  if (scans.length === 0) {
      historyDiv.innerHTML = '<p>No scan history found.</p>';
      return;
  }

  scans.forEach(scan => {
      const scanElement = document.createElement('div');
      scanElement.classList.add('scan-item');
      scanElement.innerHTML = `
          <p>
              <a href="/scan-results/${scan._id}">${scan.searchId}</a>
              <button class="delete-scan" data-scan-id="${scan._id}">X</button>
          </p>
      `;
      historyDiv.appendChild(scanElement);
  });
}

  

///// Deleting saved scan
document.addEventListener('click', async (event) => {
  if (event.target.classList.contains('delete-scan')) {
      const scanId = event.target.dataset.scanId;

      try {
          const response = await fetch(`/scan-results/${scanId}`, {
              method: 'DELETE',
          });

          if (response.ok) {
              // Remove the deleted scan from the DOM
              event.target.closest('.scan-item').remove();
              console.log('Scan deleted successfully');
          } else {
              console.error('Error deleting scan:', await response.text());
          }
      } catch (error) {
          console.error('Error deleting scan:', error);
      }
  }
});
















// Handle "Add Action" button click
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('add-action-btn')) {
    event.preventDefault(); // Prevent default form submission which reloads the page or replaces it with the raw JSON response

    const scanId = event.target.getAttribute('data-scan-id');
    const sourceName = event.target.getAttribute('data-name');
    const sourceDate = event.target.getAttribute('data-date');

    console.log(`Adding action for scanId: ${scanId}, Source: ${sourceName}, Date: ${sourceDate}`);

    saveAction(scanId, sourceName, sourceDate);
  }
});

// function to add action
async function saveAction(scanId, sourceName, sourceDate) {
  try {
      const response = await fetch('/add-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scanId, sourceName, sourceDate })
      });

      const result = await response.json();
      
      if (response.ok) {
          console.log(result.message); // This Logs the success message

          updateActionItemsUI(result.data);
      } else {
          console.error('Error adding action:', result.message);
      }
  } catch (error) {
      console.error('Error adding action:', error);
  }
}


function updateActionItemsUI(scan) {
  const scanActions = scan.actions;

  // update the action items list for this scan
  let actionItemsHTML = '';
  scanActions.forEach(action => {
      actionItemsHTML += `
          <li>
              <p>${action.description}</p>
              <form action="/complete-action" method="POST" style="display: inline;">
                  <input type="hidden" name="scanId" value="${scan._id}">
                  <input type="hidden" name="actionId" value="${action._id}">
                  <button type="submit" class="complete-button">Complete</button>
              </form>
          </li>
      `;
  });

  // Find the scan's action list and update it
  const scanActionsElement = document.querySelector(`#scan-actions-${scan._id}`);
  if (scanActionsElement) {
      scanActionsElement.innerHTML = actionItemsHTML; // Update the action items list
  }
}


















/*
Handlingg the completion of actions dynamically without reloading the page, sending the POST request and update the UI
*/
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('complete-button')) {
      e.preventDefault();

      const form = e.target.closest('form');
      const formData = new FormData(form);
      const scanId = formData.get('scanId');
      const actionId = formData.get('actionId');

      try {
          const response = await fetch('/complete-action', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ scanId, actionId }),
          });

          const result = await response.json();

          if (response.ok) {
              console.log(result.message);

              // Remove the action from the UI
              const actionItem = form.closest('li');
              if (actionItem) actionItem.remove();
          } else {
              console.error('Error completing action:', result.message);
          }
      } catch (error) {
          console.error('Error completing action:', error);
      }
  }
});

















///////////// IP Details
document.addEventListener("DOMContentLoaded", fetchAndDisplayAPIData);

function fetchAndDisplayAPIData() {
    console.log("Fetching data from the server...");

    // Call the server-side endpoint
    fetch("/api/getData")
        .then(res => res.json()) 
        .then(data => { 
            console.log(data); // Log the entire response for debugging

            // Make sure that data contains the fields you expect
            const resultsDiv = document.getElementById("ip-data");
            resultsDiv.innerHTML = ""; // Clear previous results

            if (!data || Object.keys(data).length === 0) {
                resultsDiv.innerHTML = `<p>No further FIP details available.</p>`;
                return;
            }

            resultsDiv.innerHTML = `
                <p>City: ${data.City || "Unknown"}</p>
                <p>Zip code: ${data.Postal || "Unknown"}</p>
                <p>State: ${data.RegionName || "Unknown"}</p>
                <p>Country: ${data.CountryName || "Unknown"}</p>
                <p>Timezone: ${data.TimeZone || "Unknown"}</p>
                <p>Continent: ${data.ContinentName || "Unknown"}</p>
                <p>Latitude: ${data.Latitude || "Unknown"}</p>
                <p>Longitude: ${data.Longitude || "Unknown"}</p>
                <p>Asn (Autonomous System Number): ${data.asn || "Unknown"}</p>
                <p>IP Company Provider: ${data.org || "Unknown"}</p>
            `;
        })
        .catch(err => {
            console.log(`Error: ${err}`);
            const resultsDiv = document.getElementById("ip-data");
            resultsDiv.innerHTML = `<p>Failed to load data. Please try again later.</p>`;
        });
}

