const SLEEP_TIME_QR_CHECK = 50;
const SLEEP_TIME_MESSAGE_VIEW = 1000;
const DEVICE_ID =
  "06b007045f8ef9acc6f6916baa6e57cd2d9d72edac80c5c5a559c5767de6297d";
window.LoveHair = window.LoveHair || {};
LoveHair.qrReeader = (() => {
  alert(1);

  const $ = document;
  const video = $.getElementById("lovehair_video");

  /**
   *
   * @param {*} time
   */
  const sleep = async (time) => {
    await new Promise((resolve) => setTimeout(resolve, time));
  };

  /**
   *
   */
  const initCamera = async () => {
    try {
      const medias = await navigator.mediaDevices.enumerateDevices();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        // video: {
        //   deviceId: {
        //     exact:
        //       "06b007045f8ef9acc6f6916baa6e57cd2d9d72edac80c5c5a559c5767de6297d",
        //   },
        // },
        video: {
          facingMode: "user",
        },
      });
      video.srcObject = stream;
      video.onloadedmetadata = async () => {
        video.play();
        await execQrReader();
      };
       video.style.cssText +=
         "transform: rotateY(180deg);-webkit-transform:rotateY(180deg);-moz-transform:rotateY(180deg);-ms-transform:rotateY(180deg);";
    } catch (e) {
      showUnsuportedScreen();
    }
  };

  /**
   *
   */
  const execQrReader = async () => {
    const canvas = $.getElementById("lovehair_canvas");
    const context = canvas.getContext("2d");
    //  canvas.style.transform = "scaleX(-1)";
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const ret = jsQR(imageData.data, canvas.width, canvas.height);
    console.info(`${new Date().toISOString()}  QRチェックしています`);
    if (ret) {
      console.info(`${new Date().toISOString()}  QR処理実施`);
      await execAccess(ret.data);
    } else {
      await sleep(SLEEP_TIME_QR_CHECK);
    }
    await execQrReader();
  };

  /**
   *
   * @param {*} qrUrl
   */
  const execAccess = async (qrUrl) => {
    let localqrUrl = qrUrl;
    let title = "";
    let message = "";
    try {
      console.info("qr_url=>" + localqrUrl);
      // if (env === "development") {
      //   const reservationCode = 12345345;
      //   localqrUrl = `http://localhost:8000/api/v1/checkin/${reservationCode}`;
      // }
      const res = await fetch(localqrUrl, {
        method: "GET",
        mode: "cors",
        headers: {
          accept: "application/json",
        },
      });
      const data = await res.json();
      console.info("qr_url_res_data=>" + data);
      title = "チェックインしました。";
      message = getMessage(data);
      await showProcAfter("./audio/checkin.mp3", title, message);
    } catch (e) {
      console.error(
        "QRログインアクセスにて失敗しました。qr_url_res_proc_Error=>" + e
      );
      title = "チェックインエラー";
      message = "チェックインに失敗しました。";
      await showProcAfter("./audio/error.mp3", title, message);
    }
  };

  /**
   *
   */
  const getMessage = (resData) => {
    return resData.message;
  };

  /**
   *
   */
  const showProcAfter = async (audio, title, msg) => {
    $.getElementById("lovehair_message_title").innerText = title;
    $.getElementById("lovehair_message_message").innerText = msg;
    $.getElementById("lovehair_message_area").classList.add("is-show");
    new Audio(audio).play();
    await sleep(SLEEP_TIME_MESSAGE_VIEW);
    $.getElementById("lovehair_message_area").classList.remove("is-show");
  };

  /**
   *
   */
  const showUnsuportedScreen = () => {
    console.log("showUnsuportedScreen");
    $.getElementById("lovehair_check_unsupported").classList.add("is-show");
  };

  if (!navigator.mediaDevices) {
    showUnsuportedScreen();
    return;
  }
  return {
    initCamera,
  };
})();

const init = async () => {
  if (LoveHair.qrReeader) {
    await LoveHair.qrReeader.initCamera();
  }
};
init();
