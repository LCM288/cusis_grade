// work on https://cusis.cuhk.edu.hk/psc/CSPRD/EMPLOYEE/HRMS/c/NUI_FRAMEWORK.PT_AGSTARTPAGE_NUI.GBL?CONTEXTIDPARAMS=TEMPLATE_ID%3aPTPPNAVCOL&scname=CS_SSR_ACADEMIC_RECORDS_FL&PanelCollapsible=Y&PTPPB_GROUPLET_ID=ACADEMICRECORDS&CRefName=ACADEMICRECORDS

const tabList = document.getElementsByClassName(
  "ps_ag-step-group-list-level1"
)[0];

function getGradeDetails() {
  const titles = ["class", "description", "term", "grade", "units", "status"];
  const allGradedClasses = [
    ...document.getElementsByClassName("ps_grid-body")[0].children
  ]
    .map(x => {
      obj = new Object();
      obj["subject"] = x.firstElementChild.innerText.slice(0, 4);
      [...x.children].forEach((y, i) => (obj[titles[i]] = y.innerText));
      return obj;
    })
    .filter(
      x =>
        x["status"] === "Taken" &&
        parseInt(x["units"]) &&
        x["grade"] !== "P" &&
        x["grade"] !== "PP" &&
        x["grade"] !== "FF"
    )
    .map(x => {
      x["units"] = parseInt(x["units"]);
      return x;
    });
  return allGradedClasses;
}

let gradeDetails = [];

function genGradeAnalyserPage() {
  function getGroups(groupByValue) {
    const gradeOder = [
      "A",
      "A-",
      "B+",
      "B",
      "B-",
      "C+",
      "C",
      "C-",
      "D+",
      "D",
      "F"
    ];
    let groups = gradeDetails
      .map(x => x[groupByValue])
      .filter((value, index, array) => array.indexOf(value) === index);
    switch (groupByValue) {
      case "subject":
        groups = groups
          .map(x => {
            return {
              count: gradeDetails.filter(y => y[groupByValue] === x).length,
              value: x
            };
          })
          .filter(x => x.count > 3)
          .sort((x, y) => {
            if (x.count < y.count) {
              return 1;
            } else if (x.count > y.count) {
              return -1;
            } else {
              return 0;
            }
          })
          .map(x => x.value);
        groups.push("Other");
        break;
      case "grade":
        groups.sort((x, y) => {
          if (gradeOder.indexOf(x) < gradeOder.indexOf(y)) {
            return -1;
          } else if (gradeOder.indexOf(x) > gradeOder.indexOf(y)) {
            return 1;
          } else {
            return 0;
          }
        });
        break;
      default:
        groups.sort();
    }
    return groups;
  }

  function groupByChanged() {
    const displayBySelect = document.getElementById("displayBy");
    displayBySelect.innerHTML = `
      <option disabled selected value> -- please select -- </option>
      <option value="all">All</option>
    `;
    const groupByValue = document.getElementById("groupBy").value;
    if (!groupByValue) {
      return;
    }
    const groups = getGroups(groupByValue);
    groups.forEach(groupName => {
      displayBySelect.innerHTML +=
        "<option value='" + groupName + "'>" + groupName + "</option>";
    });
  }

  function clickShowResult(event) {
    function checkBelongsToGroup(classDetails, groupMode, group, groups) {
      if (groupMode === "subject" && group === "Other") {
        return groups.indexOf(classDetails[groupMode]) == -1;
      } else {
        return classDetails[groupMode] === group;
      }
    }

    event.preventDefault();
    const groupByValue = document.getElementById("groupBy").value;
    const distinguishByValue = document.getElementById("distinguishBy").value;
    const calculateByValue = document.getElementById("calculateBy").value;
    const displayByValue = document.getElementById("displayBy").value;
    if (
      !groupByValue ||
      !distinguishByValue ||
      !calculateByValue ||
      !displayByValue
    ) {
      return;
    }
    const groupByGroups = getGroups(groupByValue);
    const distinguishByGroups = getGroups(distinguishByValue);
    let plotData;
    if (displayByValue === "all") {
      plotData = distinguishByGroups
        .map(distinguishByGroup =>
          gradeDetails.filter(classDetails =>
            checkBelongsToGroup(
              classDetails,
              distinguishByValue,
              distinguishByGroup,
              distinguishByGroups
            )
          )
        )
        .map((classesDetails, index) => {
          const trace = {
            x: groupByGroups,
            y: new Array(groupByGroups.length).fill(0),
            name: distinguishByGroups[index],
            type: "bar"
          };
          classesDetails.forEach(classDetails => {
            const groupIndex = groupByGroups.findIndex(groupName =>
              checkBelongsToGroup(
                classDetails,
                groupByValue,
                groupName,
                groupByGroups
              )
            );
            if (groupIndex != -1) {
              switch (calculateByValue) {
                case "course":
                  trace.y[groupIndex] += 1;
                  break;
                case "credit":
                  trace.y[groupIndex] += classDetails["units"];
                  break;
              }
            }
          });
          return trace;
        });
    } else {
      plotData = [
        {
          values: new Array(distinguishByGroups.length).fill(0),
          labels: distinguishByGroups,
          type: "pie",
          textinfo: "label+percent"
        }
      ];
      gradeDetails
        .filter(classDetails =>
          checkBelongsToGroup(
            classDetails,
            groupByValue,
            displayByValue,
            groupByGroups
          )
        )
        .forEach(classDetails => {
          const groupIndex = distinguishByGroups.findIndex(groupName =>
            checkBelongsToGroup(
              classDetails,
              distinguishByValue,
              groupName,
              distinguishByGroups
            )
          );
          if (groupIndex != -1) {
            switch (calculateByValue) {
              case "course":
                plotData[0].values[groupIndex] += 1;
                break;
              case "credit":
                plotData[0].values[groupIndex] += classDetails["units"];
                break;
            }
          }
        });
    }
    const layout = {
      autosize: true
    };
    Plotly.newPlot("plotDiv", plotData, layout);
  }

  const pageContainer = document.getElementById("divPAGECONTAINER_TGT");
  const gradeAnalyserRoot = document.createElement("div");

  const portlyScript = document.createElement("script");
  portlyScript.setAttribute("src", "https://cdn.plot.ly/plotly-1.2.0.min.js");

  const groupBySelectDiv = document.createElement("div");
  groupBySelectDiv.innerHTML = `
      <label for="groupBy">Group by:</label>
      <select name="groupBy" id="groupBy">
        <option disabled selected value> -- please select -- </option>
        <option value="subject">Subject</option>
        <option value="term">Term</option>
        <option value="grade">Grade</option>
      </select>
    `;

  const distinguishBySelectDiv = document.createElement("div");
  distinguishBySelectDiv.innerHTML = `
      <label for="distinguishBy">Distinguish by:</label>
      <select name="distinguishBy" id="distinguishBy">
        <option disabled selected value> -- please select -- </option>
        <option value="subject">Subject</option>
        <option value="term">Term</option>
        <option value="grade">Grade</option>
      </select>
    `;

  const calculateBySelectDiv = document.createElement("div");
  calculateBySelectDiv.innerHTML = `
      <label for="calculateBy">Calculate by:</label>
      <select name="calculateBy" id="calculateBy">
        <option disabled selected value> -- please select -- </option>
        <option value="course">By course</option>
        <option value="credit">By credit</option>
      </select>
    `;

  const displayBySelectDiv = document.createElement("div");
  displayBySelectDiv.innerHTML = `
      <label for="displayBy">Show result for:</label>
      <select name="displayBy" id="displayBy">
        <option disabled selected value> -- please select -- </option>
      </select>
  `;

  const showResultButtonDiv = document.createElement("div");
  showResultButtonDiv.innerHTML = `
    <button class='ps-button' id='showResult'>
      <span class='ps-text'>Show result</span>
    </button>
  `;

  const plotDiv = document.createElement("div");
  plotDiv.setAttribute("id", "plotDiv");

  gradeAnalyserRoot.setAttribute(
    "class",
    "ps_scrollable ps_scrollable_v sbar sbar_v"
  );
  gradeAnalyserRoot.append(portlyScript);
  gradeAnalyserRoot.append(plotDiv);
  gradeAnalyserRoot.append(groupBySelectDiv);
  gradeAnalyserRoot.append(distinguishBySelectDiv);
  gradeAnalyserRoot.append(calculateBySelectDiv);
  gradeAnalyserRoot.append(displayBySelectDiv);
  gradeAnalyserRoot.append(showResultButtonDiv);
  pageContainer.innerHTML = "";
  pageContainer.append(gradeAnalyserRoot);
  document.getElementById("groupBy").addEventListener("change", groupByChanged);
  document
    .getElementById("showResult")
    .addEventListener("click", clickShowResult);
}

async function clickGradeAnalyser() {
  cancelBubble(event);
  document
    .getElementsByClassName("ps_ag-step-group-list")[0]
    .firstElementChild.children[1].firstElementChild.click();
  await new Promise(r => setTimeout(r, 1000));
  gradeDetails = getGradeDetails();
  if (!top.ptgpPage.openCustomStepButton(`gradeAnalyser`)) {
    top.ptgpPage.selectStep(`gradeAnalyser`);
  }
  genGradeAnalyserPage();
  return false;
}

const gradeAnalyserTabButton = document.createElement("li");
gradeAnalyserTabButton.setAttribute(
  "class",
  "ps_box-scrollarea-row psc_rowact ps-listitem psc_margin-none ps_ag-step"
);
gradeAnalyserTabButton.setAttribute("ptgpid", "gradeAnalyser");
gradeAnalyserTabButton.innerHTML = `
  <div class="ps_box-group psc_layout ps_ag-step-button-wrapper">
    <div
      ptgpid="gradeAnalyser"
      onkeydown="cancelBubble(event);ptgpPage.stepKeyboardEventHandler(event, 'gradeAnalyser');"
      onclick="clickGradeAnalyser()"
      class="ps_box-group psc_layout ps_ag-step-button ps_ag-step-first psc_visited"
    >
      <div class="ps_box-group psc_layout ps_ag-step-wrapper psc_nolabel psc_display-inlineblock">
        <div class="ps_box-group psc_layout ps_ag-step-main psc_display-inlineblock">
          <div class="ps_box-group psc_layout ps_ag-step-link-wrapper">
            <div class="ps_box-img psc_margin-none ps_ag-step-link-icon psc_display-inlineblock">
              <img
                src="https://cusis.cuhk.edu.hk/cs/CSPRD/cache/PS_PERF_STATUS_PIE_CHART_L_FL_1.svg"
                class="ps-img"
                alt=""
                title="Grade Analyser"
              />
            </div><div class="ps_box-edit psc_disabled psc_wrappable psc_has_value psc_margin-none ps_ag-step-link-label psc_display-inlineblock psc_label-suppressed">
              <span class="ps_box-value">Grade Analyser</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

tabList.append(gradeAnalyserTabButton);
