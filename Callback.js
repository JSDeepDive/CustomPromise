const conditionA = false
const conditionB = false

function myCallback(successCb, failCb) {
  if (!conditionA) {
    failCb({
      name: "Condition A failed",
      message: ":(",
    })
  } else if (!conditionB) {
    failCb({
      name: "Condition B failed",
      message: "OMG",
    })
  } else {
    successCb("SUCCESS!")
  }
}

// Promise는 성공 시, 실패 시 수행할 콜백 함수의 명칭을 resolve, reject로 통일.
function myPromise() {
  return new Promise((resolve, reject) => {
    if (!conditionA) {
      reject({
        name: "Condition A failed",
        message: ":(",
      })
    } else if (!conditionB) {
      reject({
        name: "Condition B failed",
        message: "OMG",
      })
    } else {
      resolve("SUCCESS!")
    }
  })
}

myCallback(
  (message) => {
    console.log("Success case: ", message)
  },
  (error) => {
    console.log(error.name, error.message)
  }
)

// then, catch, finally 메서드 인터페이스 통해 콜백 함수를 등록.
// 특히 nested callback을 promise chaining을 통해 가독성 좋게 작성 가능.
myPromise()
  .then((message) => {
    console.log("Success case: ", message)
  })
  .catch((error) => {
    console.log(error.name, error.message)
  })
