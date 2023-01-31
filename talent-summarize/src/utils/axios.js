import axios from "axios";
import {
  getTokenAUTH,
  removeTokenAUTH,
} from "./localStorage.js";
import {
  isRepeatRequest,
  removeFinishedRequest,
  getCheckRepeatRequestUrl
} from './req.js'

const API = 'http://localhost:8000'

const isPro = process.env.NODE_ENV === 'production'
const serve = axios.create(
  {
    baseURL: isPro ? API : '/api', // 'api'  需配合webpack/vite 的target配置
    timeout: 5000,
  }
);

/**
 * 防抖，维持一个正在请求的列表，在request时加入，response时弹出，判断改请求是否正在执行
 * 不采用CancleToken的原因，cancleToken无法真正取消一个请求，只是前端不再接收返回，无法实现真正意义防抖
 */

const reqQueue = []

const map = {}


serve.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded;charset=UTF-8";


serve.interceptors.request.use(
  (config) => {
    // 添加token
    const token = getTokenAUTH();
    token &&
      config.headers &&
      (config.headers.Authorization = "Bearer " + token);
    token && config.headers && (config.headers.token = "Bearer " + token);
    const key = getCheckRepeatRequestUrl(config.url, config.method, config.data, config.params)

    if (!isRepeatRequest(reqQueue, key)) {
      reqQueue.push(key)
      return config
    }
    const __usePreData = config.headers["__usePreData"]
    if (__usePreData) {
      delete config.headers["__usePreData"]
      const promise = new Promise((resolve, reject) => {
        if (map[key] === undefined) {
          map[key] = []
        }
        map[key].push([resolve, reject])
      })
      return Promise.reject({
        key: key,
        __usePreData: true,
        promise: promise
      })
    }
    return Promise.reject({
      repeatRequest: true
    })
  },
  (error) => {
    return Promise.reject(error);
  }

);

const handleError = async (status) => {
  switch (status) {
    case 500:
      // ElMessage.error("操作错误");
      break;
    case 506:
      console.log("参数检验失败");
      break;
    case 401:
      ElMessage.error("token过期");
      removeTokenAUTH();
      break;
    case 403:
      ElMessage.error("没有相关权限");
      break;
    default:
      break;
  }
};

serve.interceptors.response.use(
  (res) => {
    console.log(res);
    const key = getCheckRepeatRequestUrl(res.config.url, res.config.method, res.config.data, res.config.params)
    map[key]?.forEach(val => {
      val[0](res)
    })
    removeFinishedRequest(reqQueue, map, key)
    handleError(res.data.code);
    return res;
  },
  (error) => {
    if (error.__usePreData) {
      return error.promise
    } else if (error.config) {
      const key = getCheckRepeatRequestUrl(error.config.url, error.config.method, error.config.data, error.config.params)
      map[key]?.forEach(val => {
        val[1](error)
      })
      removeFinishedRequest(reqQueue, map, key)
      return Promise.reject(error)
    }
  }
);



export default serve