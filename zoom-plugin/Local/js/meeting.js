import { ZoomMtg } from "@zoomus/websdk";
import { htmlPrefilter } from "jquery";
const testTool = window.testTool;
// get meeting args from url
const tmpArgs = testTool.parseQuery();
const meetingConfig = {
  apiKey: tmpArgs.apiKey,
  meetingNumber: tmpArgs.mn,
  userName: (function () {
    if (tmpArgs.name) {
      try {
        return testTool.b64DecodeUnicode(tmpArgs.name);
      } catch (e) {
        return tmpArgs.name;
      }
    }
    return (
      "CDN#" +
      tmpArgs.version +
      "#" +
      testTool.detectOS() +
      "#" +
      testTool.getBrowserInfo()
    );
  })(),
  passWord: tmpArgs.pwd,
  leaveUrl: "https://hackzurich2020.netlify.app/#/survey",
  //leaveUrl: "/index.html",
  role: parseInt(tmpArgs.role, 10),
  userEmail: (function () {
    try {
      return testTool.b64DecodeUnicode(tmpArgs.email);
    } catch (e) {
      return tmpArgs.email;
    }
  })(),
  lang: tmpArgs.lang,
  signature: tmpArgs.signature || "",
  china: tmpArgs.china === "1",
};

console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));


// it's option if you want to change the WebSDK dependency link resources. setZoomJSLib must be run at first
ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();
function beginJoin(signature) {
  ZoomMtg.init({
    leaveUrl: meetingConfig.leaveUrl,
    webEndpoint: meetingConfig.webEndpoint,
    success: function () {
      console.log(meetingConfig);
      console.log("signature", signature);
      $.i18n.reload(meetingConfig.lang);
      ZoomMtg.join({
        meetingNumber: meetingConfig.meetingNumber,
        userName: meetingConfig.userName,
        signature: signature,
        apiKey: meetingConfig.apiKey,
        userEmail: meetingConfig.userEmail,
        passWord: meetingConfig.passWord,
        success: function (res) {
          console.log("join meeting success");
          console.log("get attendeelist");
          timeout(footerPlant);
          ZoomMtg.getAttendeeslist({});
          ZoomMtg.getCurrentUser({
            success: function (res) {
              console.log("success getCurrentUser", res.result.currentUser);
            },
          });
        },
        error: function (res) {
          console.log(res);
        },
      });
    },
    error: function (res) {
      console.log(res);
    },
  });

  ZoomMtg.inMeetingServiceListener('onUserJoin', function (data) {
    console.log('inMeetingServiceListener onUserJoin', data);
  });

  ZoomMtg.inMeetingServiceListener('onUserLeave', function (data) {
    console.log('inMeetingServiceListener onUserLeave', data);
  });

  function footerPlant() {
    // Add the plant to the ZOOM overview
    var footer = document.getElementById("wc-footer");
    var titleAvatars = document.querySelector(".active-video-container__avatar");
    if (titleAvatars) {

      var titleAvatars = document.querySelector(".active-video-container__avatar");
      var loading_img = document.createElement("img");
      loading_img.style.width = "300px";
      loading_img.style.position = 'absolute';
      loading_img.style.left = '1px';
      loading_img.style.top = '600px';
      loading_img.src = "resources/plant-jump-unscreen.gif";
      loading_img.className = "sharee-container__canvas";
      console.log(footer.children[1]);
      titleAvatars.appendChild(loading_img);
      return;
    } else {
      console.log('retry')
    }

  }

  function waitingRoom() {
    // Change the visualization when waiting to be let in to the room
    var container = document.querySelector(".text-center");
    if (container) {
      var loading_circle = document.querySelector(".circle-sm-loading");
      var loading_img = document.createElement("img");
      var loading_div = document.createElement("div");
      
      loading_img.src = "resources/jasper_gif.gif";
      // loading_img.src = "resources/Feey_GifNr8_1080x1080px.gif";
      loading_img.style.width = "50%";
      // loading_img.width = "50";
      loading_div.appendChild(loading_img);
      container.insertBefore(loading_div, loading_circle);
      loading_circle.remove();
      console.log('success')
      return;
    } else {
      console.log('retry')
      timeout(waitingRoom);
    }
  }
  function timeout(funct) {
    setTimeout(function () {
      funct();
    }, 1000);
  }
  ZoomMtg.inMeetingServiceListener('onUserIsInWaitingRoom', function (data) {
    var rootElement = document.getElementById("zmmtg-root");
    console.log(rootElement);
    timeout(waitingRoom);
    console.log('inMeetingServiceListener onUserIsInWaitingRoom', data);
  });

  ZoomMtg.inMeetingServiceListener('onMeetingStatus', function (data) {
    console.log('inMeetingServiceListener onMeetingStatus', data);
  });
  ZoomMtg.inMeetingServiceListener('onMeetingUserJoin', function (data) {
  });
}

beginJoin(meetingConfig.signature);
