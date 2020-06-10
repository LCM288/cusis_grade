// work on https://cusis.cuhk.edu.hk/psc/CSPRD/EMPLOYEE/HRMS/c/NUI_FRAMEWORK.PT_AGSTARTPAGE_NUI.GBL?CONTEXTIDPARAMS=TEMPLATE_ID%3aPTPPNAVCOL&scname=CS_SSR_ACADEMIC_RECORDS_FL&PanelCollapsible=Y&PTPPB_GROUPLET_ID=ACADEMICRECORDS&CRefName=ACADEMICRECORDS
const tabList = document.getElementsByClassName(
  "ps_ag-step-group-list-level1"
)[0];

const clickGradeAnalyser = () => {
  cancelBubble(event);
  if (!top.ptgpPage.openCustomStepButton(`gradeAnalyser`)) {
    top.ptgpPage.selectStep(`gradeAnalyser`);
  }
  return false;
};

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
