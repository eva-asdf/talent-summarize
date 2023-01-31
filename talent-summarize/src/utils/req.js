const isRepeatRequest = (reqList, url) => {
  if (reqList.includes(url)) {
    return true;
  }
  return false;
};


const removeFinishedRequest = (reqList, map, url) => {
  reqList = reqList.filter(item => item !== url);
  map[url] && (map[url].length = 0)
  return reqList;
};


const getCheckRepeatRequestUrl = (url, method, data, params) => {
  if (data instanceof FormData) {
    return `${url}&&&${method}&&&data:formData_${new Date().getTime() + '' + Math.ceil(Math.random() * 100)}`;
  }
  return `${url}&&&${method}&&&${JSON.stringify(data)}&&&${JSON.stringify(params)} `;
};

export {
  isRepeatRequest,
  removeFinishedRequest,
  getCheckRepeatRequestUrl
}