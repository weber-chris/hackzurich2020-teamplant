import { ZoomMtg } from "@zoomus/websdk";

console.log("checkSystemRequirements");
console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));
ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();

const API_KEY = "";

const API_SECRET = "";

testTool = window.testTool;
document.getElementById("display_name").value =
  "Local" +
  ZoomMtg.getJSSDKVersion()[0] +
  testTool.detectOS() +
  "#" +
  testTool.getBrowserInfo();
document.getElementById("meeting_number").value = testTool.getCookie(
  "meeting_number"
);
document.getElementById("meeting_pwd").value = testTool.getCookie(
  "meeting_pwd"
);
if (testTool.getCookie("meeting_lang"))
  document.getElementById("meeting_lang").value = testTool.getCookie(
    "meeting_lang"
  );

document.getElementById("meeting_lang").addEventListener("change", (e) => {
  testTool.setCookie(
    "meeting_lang",
    document.getElementById("meeting_lang").value
  );
  $.i18n.reload(document.getElementById("meeting_lang").value);
  ZoomMtg.reRender({ lang: document.getElementById("meeting_lang").value });
});

// copy zoom invite link to mn, autofill mn and pwd.
document
  .getElementById("meeting_number")
  .addEventListener("input", function (e) {
    let tmpMn = e.target.value.replace(/([^0-9])+/i, "");
    if (tmpMn.match(/([0-9]{9,11})/)) {
      tmpMn = tmpMn.match(/([0-9]{9,11})/)[1];
    }
    let tmpPwd = e.target.value.match(/pwd=([\d,\w]+)/);
    if (tmpPwd) {
      document.getElementById("meeting_pwd").value = tmpPwd[1];
      testTool.setCookie("meeting_pwd", tmpPwd[1]);
    }
    document.getElementById("meeting_number").value = tmpMn;
    testTool.setCookie(
      "meeting_number",
      document.getElementById("meeting_number").value
    );
  });

document.getElementById("clear_all").addEventListener("click", (e) => {
  testTool.deleteAllCookies();
  document.getElementById("display_name").value = "";
  document.getElementById("meeting_number").value = "";
  document.getElementById("meeting_pwd").value = "";
  document.getElementById("meeting_lang").value = "en-US";
  document.getElementById("meeting_role").value = 0;
  window.location.href = "/index.html";
});

document.getElementById("join_meeting").addEventListener("click", (e) => {
  e.preventDefault();

  const meetingConfig = testTool.getMeetingConfig();
  if (!meetingConfig.mn || !meetingConfig.name) {
    alert("Meeting number or username is empty");
    return false;
  }
  testTool.setCookie("meeting_number", meetingConfig.mn);
  testTool.setCookie("meeting_pwd", meetingConfig.pwd);

  const signature = ZoomMtg.generateSignature({
    meetingNumber: meetingConfig.mn,
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    role: meetingConfig.role,
    success: function (res) {
      console.log(res.result);
      meetingConfig.signature = res.result;
      meetingConfig.apiKey = API_KEY;
      const joinUrl = "/meeting.html?" + testTool.serialize(meetingConfig);
      console.log(joinUrl);
      window.open(joinUrl, "_blank");
    },
  });
});

// click copy jon link button
window.copyJoinLink = function (element) {
  const meetingConfig = testTool.getMeetingConfig();
  if (!meetingConfig.mn || !meetingConfig.name) {
    alert("Meeting number or username is empty");
    return false;
  }
  const signature = ZoomMtg.generateSignature({
    meetingNumber: meetingConfig.mn,
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    role: meetingConfig.role,
    success: function (res) {
      console.log(res.result);
      meetingConfig.signature = res.result;
      meetingConfig.apiKey = API_KEY;
      const joinUrl =
        testTool.getCurrentDomain() +
        "/meeting.html?" +
        testTool.serialize(meetingConfig);
      $(element).attr("link", joinUrl);
      const $temp = $("<input>");
      $("body").append($temp);
      $temp.val($(element).attr("link")).select();
      document.execCommand("copy");
      $temp.remove();
    },
  });
};

