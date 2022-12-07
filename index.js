const svg = document.getElementById('canvas');
const map = document.getElementById('map');
const statusDisplay = document.getElementById('status_display');
const imageDisplay = document.getElementById('default-image');
const readingDisplay = document.getElementById('reading');
const unitDisplay = document.getElementById('unit');
const notifyButton = document.getElementById('notify_button');
const resetImage = document.getElementById("notify_button");

const STATUS = {
  MOVING: 'moving',
  CAPTURE: 'capture',
  CAPTURED: 'captured',
  PROCESSED: 'processed',
  NOTIFIED: 'notified'
}

let current = 0;
const interval = 5000

const setStatus = (status) => {
  statusDisplay.innerText = status;
}

const sendStatus = async (status) => {
  let formData = new FormData();
  formData.append('status', status);
  try {
    let response = await axios.post("http://ec2-15-206-84-230.ap-south-1.compute.amazonaws.com:8001/status-drone", formData);
    console.log(response);
    return response.data;
  } catch (e) {
    console.error(e);
    return 'ERROR';
  }
}

const getStatus = async () => {
  try {
    let response = await axios.get("http://ec2-15-206-84-230.ap-south-1.compute.amazonaws.com:8001/status-from-app-to-html");
    data = response.data.current_status;
    return data;
  } catch (e) {
    console.error(e);
    return 'ERROR';
  }
}

const getReadingData = async () => {
  try {
    let response = await axios.get("http://ec2-15-206-84-230.ap-south-1.compute.amazonaws.com:8001/get-last-reading");
    val = response.data.reading;
    unit = response.data.unit;
    img = response.data.img;
    return response;
  } catch (e) {
    console.error(e);
    return 'ERROR';
  }
}

const pollDataFromApp = () => {
  setTimeout(async () => {
    const status = await getStatus();
    console.log("status", status);
    if (status === 'ERROR') {
      setStatus('Unable to fetch status from application.');
    } else if (status === STATUS.PROCESSED) {
      //Exit condition
      setStatus('Downloading data...');
      const data = await getReadingData();
      console.log("data", data);
      ;
      if (data === 'ERROR') {
        setStatus('Unable to download the image data.');
      } else {
        //Data is present
        setStatus('Processing complete. Displaying reading.');
        imageDisplay.src = `data:image/png;base64, ${data.data.img}`;
        readingDisplay.innerText = data.data.reading;
        unitDisplay.innerText = data.data.unit;
        notifyButton.removeAttribute('disabled');
      }
    } else {
      if (data === STATUS.CAPTURED) {

        setStatus("Captured image! Waiting for Processing to complete");

      }
      pollDataFromApp();
    }
  }, interval);
}

const resetImg = () => {
  d_img = 'https://www.linkpicture.com/q/icon_1.jpg'
  imageDisplay.src = `${d_img}`;
  readingDisplay.innerText = "";
  unitDisplay.innerText = "";
}


const notify = async () => {
  setStatus('Notifying user with reading');
  const response = await sendStatus(STATUS.NOTIFIED);
  if (response === 'ERROR') {
    setStatus('Error notifying user. Please try again.');
  } else {
    setStatus('User notified. Will continue with the journey');
    //empty image and empty reading
    resetImg();
    setTimeout(() => {
      start();
    }, interval);
  }
}

const isCapturePoint = (path) => {
  return path.getAttribute('data-capture') === 'true';
}

let timeout = null;

const move = (to) => {
  notifyButton.setAttribute('disabled', 'disabled');
  const path = map.querySelector(`[data-index="${to}"]`);
  if (!path) { current = 0; return; }
  path.classList.add('current');
  if (path.hasAttribute('data-status') && !isCapturePoint(path)) {
    sendStatus(path.getAttribute('data-status'));
  }
  setStatus(path.getAttribute('data-status'));

  timeout = setTimeout(() => {
    if (isCapturePoint(path)) {
      //Send capture signal to app
      //Poll for next status (Processed)
      sendStatus(path.getAttribute('data-status'));
      setStatus('Sending capture signal');
      setTimeout(async () => {
        await sendStatus(STATUS.CAPTURE);
        setStatus('Capture signal sent. Waiting for process to complete.');
        pollDataFromApp();
      }, interval);
    } else {
      path.classList.remove('current');
      current = to + 1;
      move(current);
    }
  }, interval);
}

const start = () => {
  map.querySelector('.current')?.classList.remove('current');
  move(current + 1);
}

const stop = () => {
  const status = map.querySelector('.current')?.getAttribute('data-status');
  if (status) statusDisplay.innerText = `${status} (Stopped)`;
  if (!!timeout) clearTimeout(timeout);
}

const reset = () => {
  stop();
  setStatus('');
  current = 0;
  map.querySelector('.current')?.classList.remove('current');
}


const itemsContainer = document.querySelector(".items-container");
let columns = 0;

const setItemsHeight = () => {
  for (const div of itemsContainer.children) {
    div.style.height = `calc(${100 / columns}% - 10px)`;
  }
}







let images = JSON.parse(localStorage.getItem("images") ?? '[]');

function makeid() {
  var length = 10;
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const uploadImages = (e) => {
  const filesLength = e.target.files?.length ?? 0;
  let pushed = 0;
  const imageId = makeid();
  for (let file of e.target.files) {
    const fr = new FileReader();
    fr.readAsText(upload.files[0]);
    fr.onload = () => {
      // console.log(fr.result);
      images.push({ id: imageId, images: encodeURIComponent(fr.result) });
      localStorage.setItem('images', JSON.stringify(images));
      addImageToUI(fr.result, imageId)
      pushed++;
      if (pushed === filesLength) e.target.reset();
    }
  }
}

document.getElementById('upload').addEventListener('change', uploadImages);
let count = 4;
const addImageToUI = (image, imageId, add = true) => {
  const div = document.createElement("div");
  div.className = "container_map";
  
  div.id = imageId;

  div.innerHTML = image;
  div.innerHTML += (`<center><span class="map_title">Map ${count}</span></center>`);
  div.innerHTML += `<button class="btn" onclick="removeImageFromUI('${imageId}')">Delete</button>`;

  const s = div.querySelector('svg');

  s.id = "canvas_1";

  s.classList = "canvas_thumb";
  const ss = s.querySelector('g');
  ss.id = "map";
  itemsContainer.append(div);



  count += 1;
  console.log(div);

  if (add) {
    div.addEventListener('click', (e) => {
      const mapSVG = e.target.closest('.container_map');


      const mapName = mapSVG.querySelector('.map_title').innerText;
      console.log(mapSVG);
      sessionStorage.setItem('selected_map', mapSVG.querySelector('#map').innerHTML);
      const pathname = "map.html"
      const search = (!!window.location.search ? window.location.search + `&` : `?`) + `mapName=${mapName}`
      window.location.href = pathname + search;
    });
  }
}


const loadSaved = () => {
  for (let imageObject of images) {
    addImageToUI(decodeURIComponent(imageObject.images), imageObject.id, false);
  }
}

loadSaved();

const removeImageFromUI = (id) => {
  document.getElementById(id).remove();
  const deletedImage = JSON.parse(localStorage.getItem("images") ?? '[]');
  const deleted = deletedImage.filter((obj) =>
    obj.id !== id
  )
  // console.log(deleted);
  localStorage.setItem('images', JSON.stringify(deleted));
}


const maps = document.getElementsByClassName('canvas_thumb');
for (let map of maps) {
  // console.log(map);
  map.addEventListener('click', (e) => {
    const mapSVG = e.target.closest('.container_map');
    const mapName = mapSVG.querySelector('.map_title').innerText;
    // console.log(mapSVG);
    sessionStorage.setItem('selected_map', mapSVG.querySelector('#map').innerHTML);
    const pathname = "map.html"
    const search = (!!window.location.search ? window.location.search + `&` : `?`) + `mapName=${mapName}`
    window.location.href = pathname + search;
  });
}


