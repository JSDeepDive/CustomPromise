const STATE = {
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
}

/* Promise : 비동기 처리 상태(state)와 결과(result)를 저장한 객체.
 *           then, catch, finally 메서드를 통해 콜백 함수들을 받아 배열 형태로 저장해둔 객체.
 * 			     상태(state)가 변경되면, 상태값에 따라 어떤 콜백함수 배열을 호출할 것인지를 결정.
 *           		(1) fulfilled: thenCbs 호출
 * 							(2) rejected: catchCbs 호출.
 *           이 때 콜백함수 인자로는 result가 들어감.
 * 					 resolve 함수 호출 시 상태가 fulfilled로, reject 함수 호출 시 상태가 rejected로 변경됨.
 **/
class MyPromise {
  #thenCbs = []
  #catchCbs = []
  #finallyCbs = []
  #state = STATE.PENDING
  #result

  // promise chaining을 위해 this 바인딩 수행
  #onFulfilledBind = this.#onFulfilled.bind(this)
  #onRejectedBind = this.#onRejected.bind(this)

  constructor(cb) {
    try {
      cb(this.#onFulfilledBind, this.#onRejectedBind)
    } catch (e) {
      this.#onRejected(e)
    }
  }

  #runCallbacks() {
    queueMicrotask(() => {
      if (this.#state === STATE.FULFILLED) {
        this.#thenCbs.forEach((callback) => {
          callback(this.#result)
        })

        this.#thenCbs = [] // 여러 then 내 thenCbs 재호출 방지
      }

      if (this.#state === STATE.REJECTED) {
        this.#catchCbs.forEach((callback) => {
          callback(this.#result)
        })

        this.#catchCbs = [] // 여러 then 내 catchCbs 재호출 방지
      }

      if (this.#state !== STATE.PENDING) {
        this.#finallyCbs.forEach((callback) => {
          callback()
        })

        this.#finallyCbs = []
      }
    })
  }

  #onFulfilled(result) {
    if (this.#state !== STATE.PENDING) return // 동일 then 내 resolve 재호출 방지

    if (result instanceof MyPromise) {
      result.then(this.#onFulfilledBind, this.#onRejectedBind)
      return
    }

    this.#result = result
    this.#state = STATE.FULFILLED
    this.#runCallbacks()
  }

  #onRejected(result) {
    if (this.#state !== STATE.PENDING) return // 동일 then 내 reject 재호출 방지

    if (result instanceof MyPromise) {
      result.then(this.#onFulfilledBind, this.#onRejectedBind)
      return
    }

    this.#result = result
    this.#state = STATE.REJECTED
    this.#runCallbacks()
  }

  then(thenCb, catchCb) {
    // if (thenCb != undefined) this.#thenCbs.push(thenCb);
    // if (catchCb != undefined) this.#catchCbs.push(catchCb);

    return new MyPromise((resolve, reject) => {
      // TODO then 내부 에러 catch에서만 잡을 수 있는 까닭
      this.#thenCbs.push((result) => {
        // then(undefined, catchCb) 처리
        if (thenCb == undefined) {
          resolve(result)
          return
        }

        try {
          resolve(thenCb(result))
        } catch (e) {
          // then 내부에서 에러가 있으면, 다음으로 넘김.
          reject(e)
        }
      })

      this.#catchCbs.push((result) => {
        // then(thenCb) 처리
        if (catchCb == undefined) {
          reject(result)
          return
        }

        try {
          resolve(catchCb(result)) // chaining
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  catch(cb) {
    return this.then(undefined, cb)
  }

  // finally는 result를 인자로 사용하지 않지만, result를 다음 메서드로 전달하긴 함.
  finally(cb) {
    return this.then(
      (result) => {
        cb()
        return result
      },
      (result) => {
        cb()
        throw result
      }
    )
  }

  static resolve(result) {
    return new Promise((resolve) => {
      resolve(result)
    })
  }

  static reject(result) {
    return new Promise((resolve, reject) => {
      reject(result)
    })
  }

  static all(promises) {
    const results = []
    let completedPromises = 0

    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i]
        promise
          .then((result) => {
            completedPromises++
            results[i] = result
            // 모든 promise 결과값이 나오면 수행
            if (completedPromises === promises.length) {
              resolve(results)
            }
          })
          .catch(reject)
      }
    })
  }

  static allSettled(promises) {
    const results = []
    let completedPromises = 0

    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i]
        promise
          .then((result) => {
            results[i] = { status: STATE.FULFILLED, result }
          })
          .catch((reason) => {
            results[i] = { status: STATE.REJECTED, reason }
          })
          .finally(() => {
            completedPromises++
            if (completedPromises === promises.length) {
              resolve(results)
            }
          })
      }
    })
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach((promise) => {
        promise.then(resolve).catch(reject)
      })
    })
  }

  // all과 반대로 동작
  static any(promises) {
    const errors = []
    let rejectedPromises = 0

    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i]
        promise.then(resolve).catch((result) => {
          rejectedPromises++
          errors[i] = result
          // 모든 promise 결과값이 나오면 수행
          if (rejectedPromises === promises.length) {
            reject(new AggregateError(errors, "ALl promises were rejected"))
          }
        })
      }
    })
  }
}

module.exports = MyPromise
