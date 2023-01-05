const STATE = {
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
};

/* Promise : 비동기 처리 상태(state)와 결과(result)를 저장한 객체.
 *           then, catch, finally 메서드를 통해 콜백 함수들을 받아 배열 형태로 저장해둔 객체.
 * 			     상태(state)가 변경되면, 상태값에 따라 어떤 콜백함수 배열을 호출할 것인지를 결정함.
 *           이 때 콜백함수 인자로는 result가 들어감.
 *           (1) fulfilled: thenCbs 호출 (2) rejected: catchCbs 호출.
 **/
class MyPromise {
  #thenCbs = [];
  #catchCbs = [];
  #state = STATE.PENDING;
  #result;

  constructor(cb) {
    try {
      cb(this.#onFulfilled, this.#onRejected);
    } catch (e) {
      this.#onRejected(e);
    }
  }

  #runCallbacks() {
    if (this.#state === STATE.FULFILLED) {
      this.#thenCbs.forEach((callback) => {
        callback(this.#result);
      });

      this.#thenCbs = [];
    }

    if (this.#state === STATE.REJECTED) {
      this.#catchCbs.forEach((callback) => {
        callback(this.#result);
      });

      this.#catchCbs = [];
    }
  }

  #onFulfilled(result) {
    this.#result = result;
    this.#state = STATE.FULFILLED;
    this.#runCallbacks();
  }

  #onRejected(result) {
    this.#result = result;
    this.#state = STATE.REJECTED;
    this.#runCallbacks();
  }

  then(cb) {
    this.#thenCbs.push(cb);
    // this.#runCallbacks();
  }
}

module.exports = MyPromise;

const p = new Promise((resolve, reject) => {
  resolve("RESOLVE");
  reject("REJECT");
});

p.then(() => {}).catch(() => {});
