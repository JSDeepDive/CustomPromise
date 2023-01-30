const STATE = {
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
};

/* Promise : 비동기 처리 상태(state)와 결과(result)를 저장한 객체.
 *           then, catch, finally 메서드를 통해 콜백 함수들을 받아 배열 형태로 저장해둔 객체.
 * 			     상태(state)가 변경되면, 상태값에 따라 어떤 콜백함수 배열을 호출할 것인지를 결정.
 *           		(1) fulfilled: thenCbs 호출
 * 							(2) rejected: catchCbs 호출.
 *           이 때 콜백함수 인자로는 result가 들어감.
 * 					 resolve 함수 호출 시 상태가 fulfilled로, reject 함수 호출 시 상태가 rejected로 변경됨.
 **/
class MyPromise {
  #thenCbs = [];
  #catchCbs = [];
  #state = STATE.PENDING;
  #value;

  // promise chaining을 위해 this 바인딩 수행
  #onSuccessBind = this.#onSuccess.bind(this);
  #onFailBind = this.#onFail.bind(this);

  constructor(cb) {
    try {
      cb(this.#onSuccessBind, this.#onFailBind);
    } catch (e) {
      this.#onFail(e);
    }
  }

  #runCallbacks() {
    if (this.#state === STATE.FULFILLED) {
      this.#thenCbs.forEach((callback) => {
        callback(this.#value);
      });

      this.#thenCbs = [];
    }

    if (this.#state === STATE.REJECTED) {
      this.#catchCbs.forEach((callback) => {
        callback(this.#value);
      });

      this.#catchCbs = [];
    }
  }

  #onSuccess(value) {
    if (this.#state !== STATE.PENDING) return;

    if (value instanceof MyPromise) {
      value.then(this.#onSuccessBind, this.#onFailBind);
      return;
    }

    this.#value = value;
    this.#state = STATE.FULFILLED;
    this.#runCallbacks();
  }

  #onFail(value) {
    if (this.#state !== STATE.PENDING) return;

    if (value instanceof MyPromise) {
      value.then(this.#onSuccessBind, this.#onFailBind);
      return;
    }

    this.#value = value;
    this.#state = STATE.REJECTED;
    this.#runCallbacks();
  }

  then(thenCb, catchCb) {
    // if (thenCb != null) this.#thenCbs.push(thenCb);
    // if (catchCb != null) this.#catchCbs.push(catchCb);

    return new MyPromise((resolve, reject) => {
      this.#thenCbs.push((result) => {
        if (thenCb == null) {
          // catch 처리
          resolve(result);
          return;
        }

        try {
          resolve(thenCb(result)); // chaining
        } catch (e) {
          reject(e);
        }
      });

      this.#catchCbs.push((result) => {
        if (catchCb == null) {
          reject(result);
          return;
        }

        try {
          resolve(catchCb(result)); // chaining
        } catch (e) {
          reject(e);
        }
      });

      this.#runCallbacks();
    });
  }

  catch(cb) {
    return this.then(undefined, cb);
  }

  finally(cb) {
    return undefined;
  }
}

module.exports = MyPromise;
