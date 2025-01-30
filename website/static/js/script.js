document.addEventListener("DOMContentLoaded", function () {
  const inputField = document.getElementById("userInput");
  const sendButton = document.getElementById("sendButton");
  const nextButton = document.getElementById("nextButton");
  const backButton = document.getElementById("backButton");
  const viewReportButton = document.getElementById("viewReportButton");
  const tableContainer = document.getElementById("table-container");
  const reportTitles = ["Income Statement", "Cash Flow", "Balance Sheet"];

  function sendDataToFlask(value) {
    fetch("/send_input", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: value }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          console.log("Response from Flask:", data);
          renderTables(data);
          nextButton.style.display = "block";
          viewReportButton.style.display = "block";
        }
      })
      .catch((error) => console.error("Error sending data:", error));
  }

  sendButton.addEventListener("click", function (event) {
    event.preventDefault();
    const inputValue = inputField.value.trim();
    inputValue
      ? sendDataToFlask(inputValue)
      : alert("Please enter some text before sending.");
  });

  function fetchData(inputValue) {
    fetch("/next_year", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input_value: inputValue }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data) {
          nextButton.style.display = "none";
          return;
        }
        const { reports, index, starting_index } = data;
        updateButtons(index, starting_index);
        renderTables(reports);
      })
      .catch((error) => console.error("Error:", error));
  }

  function updateButtons(index, starting_index) {
    nextButton.style.display = index === 0 ? "none" : "block";
    backButton.style.display = index === starting_index ? "none" : "block";
  }

  function renderTables(reports) {
    tableContainer.innerHTML = "";
    reports.forEach((report, reportIndex) => {
      const table = document.createElement("table");
      table.classList.add("report-table");

      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");
      const years = new Set(
        report.flatMap((item) =>
          Object.keys(item).filter((key) => key !== "label")
        )
      );

      thead.innerHTML = `<tr><th>Label</th>${[...years]
        .map((year) => `<th>${year}</th>`)
        .join("")}</tr>`;

      report.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${item.label}</td>${[...years]
          .map((year) => `<td>${item[year] || ""}</td>`)
          .join("")}`;
        tbody.appendChild(row);
      });

      table.appendChild(thead);
      table.appendChild(tbody);

      const tableTitle = document.createElement("h3");
      tableTitle.textContent = reportTitles[reportIndex];
      tableContainer.appendChild(tableTitle);
      tableContainer.appendChild(table);
    });
  }

  nextButton.addEventListener("click", () => fetchData(true));
  backButton.addEventListener("click", () => fetchData(false));
});

document
  .getElementById("viewReportButton")
  .addEventListener("click", function () {
    // Sending the data to Flask (adjust the URL as needed)
    fetch("/view_report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_input: document.getElementById("userInput").value, // Send the user input or any other data you need
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from Flask (optional)
        console.log("Report data received:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
