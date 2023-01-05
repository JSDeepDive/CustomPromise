const STATE = {
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
};

/* Promise : 비동기 처리 상태(state)와 결과(result)를 저장한 객체.
 *           then, catch, finally 메서드를 통해 콜백 함수들을 받아 배열 형태로 저장해둔 객체.
 * 			     상태(state)가 변경되면, 상태값에 따라 어떤 콜백함수 배열을 호출할 것인지를 결정함.
 *           (1) fulfilled: thenCbs 호출 (2) rejected: catchCbs 호출.
 *           이 때 콜백함수 인자로는 result가 들어감.
 * 					 resolve 함수 호출 시 상태가 fulfilled로, reject 함수 호출 시 상태가 rejected로 변경됨.
 **/
class MyPromise {
  #thenCbs = [];
  #catchCbs = [];

  #state = STATE.PENDING;
  #result;

  // 향후 chaining을 위해 인스턴스(프로미스 객체)에 this binding 시켜줌.
  #onFulfilledBind = this.#onFulfilled.bind(this);
  #onRejectedBind = this.#onRejected.bind(this);

  constructor(cb) {
    try {
      cb(this.#onFulfilledBind, this.#onRejectedBind);
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
    // promise의 후속처리 메서드는 마이크로태스크 큐에 들어갔다 콜스택으로 불려와 처리됨.
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return; // 상태 변화시 단 한 번만 호출.

      // Promise라면 동작 마친 뒤 수행하도촐 처리
      if (result instanceof MyPromise) {
        result.then(this.#onFulfilledBind, this.#onRejectedBind);
        return;
      }

      this.#result = result;
      this.#state = STATE.FULFILLED;
      this.#runCallbacks();
    });
  }

  #onRejected(result) {
    // promise의 후속처리 메서드는 마이크로태스크 큐에 들어갔다 콜스택으로 불려와 처리됨.
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return; // 상태 변화시 단 한 번만 호출.

      // Promise라면 동작 마친 뒤 수행하도촐 처리
      if (result instanceof MyPromise) {
        result.then(this.#onFulfilledBind, this.#onRejectedBind);
        return;
      }

      this.#result = result;
      this.#state = STATE.REJECTED;
      this.#runCallbacks();
    });
  }

  then(thenCb, catchCb) {
    return new MyPromise((resolve, reject) => {
      this.#thenCbs.push((result) => {
        // catch(null/undefined, reject) 코드에서 넘어가기 위해 사용
        if (thenCb == null) {
          resolve(result);
          return;
        }
        try {
          // 이전 promise에서 리턴한 값을 다음 promise로 전달
          resolve(thenCb(result));
        } catch (err) {
          // then 내부의 err를 catch에서 잡을 수 있는 까닭
          reject(err);
        }
      });

      this.#catchCbs.push((result) => {
        // then(resolve, _) 코드에서 넘어가기 위해 사용
        if (catchCb == null) {
          reject(result);
          return;
        }
        try {
          // 이전 promise에서 리턴한 값을 다음 promise로 전달
          resolve(catchCb(result));
        } catch (err) {
          reject(err);
        }
      });

      this.#runCallbacks();
    });
  }

  // catch(cb)는 then(undefined, cb)와 동일하게 동작
  catch(cb) {
    return this.then(undefined, cb);
  }
}

module.exports = MyPromise;

const p = new Promise((resolve, reject) => {
  resolve("RESOLVE");
  reject("REJECT");
});

p.then(
  () => {},
  () => {}
).catch(() => {});
