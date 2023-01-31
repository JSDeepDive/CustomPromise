# MyPromise

# Vanilla Javascript로 Promise 직접 구현하기

- 이 프로젝트에서는 Javascript `Promise` 동작 방식을 이해하기 위해, 이와 동일한 기능을 수행하는 커스텀 클래스 `MyPromise`를 직접 구현해 보았다.



## 목차
- 핵심만 알고자하면 세부 구현은 건너 뛰고 2. [Promise 내부 동작 방식 🏗️](https://github.com/JSDeepDive/CustomPromise/edit/main/README.md#2-promise-%EB%82%B4%EB%B6%80-%EB%8F%99%EC%9E%91-%EB%B0%A9%EC%8B%9D-%EF%B8%8F)만 읽어도 충분하다.
0. [들어가며](https://github.com/JSDeepDive/CustomPromise/edit/main/README.md#0-%EB%93%A4%EC%96%B4%EA%B0%80%EB%A9%B0)
1. [Promise란 대체 무엇인가 🧑🏻‍💻](https://github.com/JSDeepDive/CustomPromise/edit/main/README.md#1-promise%EB%9E%80-%EB%8C%80%EC%B2%B4-%EB%AC%B4%EC%97%87%EC%9D%B8%EA%B0%80-)
2. [Promise 내부 동작 방식 🏗️](https://github.com/JSDeepDive/CustomPromise/edit/main/README.md#2-promise-%EB%82%B4%EB%B6%80-%EB%8F%99%EC%9E%91-%EB%B0%A9%EC%8B%9D-%EF%B8%8F)
3. [Promise가 해결한 문제 🔧](https://github.com/JSDeepDive/CustomPromise/edit/main/README.md#3-promise%EA%B0%80-%ED%95%B4%EA%B2%B0%ED%95%9C-%EB%AC%B8%EC%A0%9C-)
4. [Promise의 한계 👿](https://github.com/JSDeepDive/CustomPromise/edit/main/README.md#4-promise%EC%9D%98-%ED%95%9C%EA%B3%84-)



## 0. 들어가며

- 비동기 처리에는 무조건 `async/await` 패턴만 사용하다가, Javascript의 대표적 비동기 처리 방식인 (1) 콜백 패턴 (2) Promise 패턴 (3) async/await 패턴 `각각의 장단점을 알고 써야하지 않을까`하는 생각이 불현듯 들었다. (~~이 강을 건너지 말았어야 했다…~~)
- 시중의 자바스크립트 자습서, 유명 블로그 포스트를 뒤져가며 각 패턴의 장단점을 텍스트 형태로 학습했지만, 코드로 옮기질 않으니 도통 와닿지 않는다.
- `직접 Promise를 구현해보면, 콜백 패턴의 한계를 Promise가 어떻게 해결하려 했는지 이해할 수 있지 않을까?`라는 단촐한 생각에서 출발한 프로젝트를 소개한다.




## 1. Promise란 대체 무엇인가 🧑🏻‍💻

- 하단은 `Promise`를 직접 작성한 `custom Promise`인 `MyPromise` 세부 코드에 대한 설명이다. 이해가 되지 않는 부분이 있다면 펼쳐 세부 구현  확인해보자.


<details> <summary> <h3> ✅ Promise는 state, result, 콜백 함수 배열들을 상태값으로 갖는 객체이다. </h3> </summary>

<h4> [🔍Javascript Promise 구현 방식을 살펴보자] </h4>
- custom Promise인 MyPromise를 구현하기 전에 우선 Javascript에서 Promise가 어떻게 구현되어 있는지 살펴보자. 
- Javascript에서는 `new` 키워드와 함께 `Promise 생성자 함수`를 호출하여 `Promise 객체`를 생성할 수 있다.     
    ```javascript
    const promise = new Promise((resolve, reject) => {
        const value = 'value'
        if(	/* 비동기 처리 성공 시 */) {
          resolve(value)
        }
      else { /* 비동기 처리 실패 시 */
        reject(value) 
      }
    })
    ```
        
- 이렇게 생성된 promise 객체는 `[[PromiseState]]`와 `[[PromiseResult]]` 상태값을 가진다. 
- 이 외에도 객체에는 비동기 후속처리를 위한 메서드인 `then`, `catch`, `finally`가 포함된다.
    <img src="https://user-images.githubusercontent.com/48196721/215739634-b7234ea9-05ba-474c-80fa-4cc348945dcd.png" width="450px" title="Promise 구성" alt="Promise 구성"></img>


<h4> [🧑🏻‍💻 MyPromise에 mocking 해보자] </h4>
- 클래스 문법으로 직접 MyPromise를 직접 구현해보자. Promise는 `비동기 처리 상태(state)`와 `처리 결과(result)`를 갖는 객체로 구현할 수 있다. 
- 비동기 후속처리 메서드인  `then`, `catch`, `finally`를 통해 등록한 콜백함수들은 MyPromise 내에서 배열 형태로 관리해주어야 한다.        
    ```javascript
    const STATE = {
      PENDING: "pending",
      FULFILLED: "fulfilled",
      REJECTED: "rejected",
    }

    class MyPromise {
      #state = STATE.PENDING
      #result
        #thenCbs = []
      #catchCbs = []
      #finallyCbs = []

      constructor(cb) {
        try {
          cb(this.#onFulfilled, this.#onRejected)
        } catch (e) {
          this.#onRejected(e)
        }

      #onFulfilled(result) {...} // promise의 resolve 함수
      #onRejected(result) {...}  // promise의 reject 함수
    }
    ```
        
</details>

<details> <summary> <h3> ✅ Promise 후속 처리 메서드는 콜백함수 배열에 인자를 추가한다. </h3> </summary>

<h4> [🔍Javascript Promise 구현 방식을 살펴보자] </h4>
- Javascript에서는 `then`, `catch`, `finally` 함수를 통해 비동기 후속처리와 관련된 콜백 함수들을 `Promise` 객체에 등록할 수 있다.
    - `then`은 비동기 처리가 성공했을 때 호출 할 성공 처리 콜백 함수인 `onFulfilled`와 실패 시 호출할 실패 처리 콜백함수인 `onRejected`를 인자로 받는다.
    - `catch`는 비동기 처리 실패 콜백 함수만을 인자로 받는다. 콜백 함수의 인자로 실패 원인에 대한 값을 받는다.
    - `finally`는 비동기 성공, 처리 실패 여부와 관계 없이 실행할 콜백 함수를 인자로 받는다. 콜백 함수에서는 별도의 인자를 받지 않는다.

    ```javascript
    then(onFulfilled)
    then(onFulfilled, onRejected)
    then(
      (result) => { /* fulfillment handler */ },
      (reason) => { /* rejection handler */ },
    )

    catch(onRejected)
    catch((reason) => {
      // rejection handler
    })

    finally(onFinally)
    finally(() => {
      // Code that will run after promise is settled (fulfilled or rejected)
    })
    ```
        
<h4> [🧑🏻‍💻 MyPromise에 mocking 해보자] </h4>
- MyPromise에 `then`, `catch`, `finally` 메서드를 구현해보자.
    - `then` 메서드는 `promise 성공, 실패 시의 콜백 함수` 둘 모두나 둘 중 하나만을 받을 수도 있으므로 `undefined` 조건문을 추가해 처리한다.
    - `catch(cb)` 메서드는 `then(undefined, cb)`와 동일하므로 이로 대체할 수 있다.
        - `finally(cb)` 메서드는 인자를 전달받지 않고 콜백함수를 수행하되, `result`는 전달해 주어야 하므로 아래와 같은 형태로 작성할 수 있다.
        
        ```javascript
        class MyPromise {
        	...
          #thenCbs = []
          #catchCbs = []
        
        	then(thenCb, catchCb) {
        		if (thenCb != undefined) this.#thenCbs.push(thenCb);
            if (catchCb != undefined) this.#catchCbs.push(catchCb);
          }
        
        	catch(cb) {
            this.then(undefined, cb)
          }
        	
        	finally(cb) {
        		this.then(
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
        }
        ```
</details>


<details> <summary> <h3> ✅ resolve, reject 호출로 Promise 상태가 변화하면, 처리 결과를 인자로 콜백 함수 배열이 호출된다. </h3> </summary>

<h4> [🔍Javascript Promise 구현 방식을 살펴보자] </h4>

- Javascript에서는 `Promise` 성공시 `resolve`, 실패시 `reject` 함수를 호출한다.
        
        ```javascript
        const promise = new Promise((resolve, reject) => {
        	const value = 'value'
        	if(	/* 비동기 처리 성공 시 */) {
        	  resolve(value)
        	}
          else { /* 비동기 처리 실패 시 */
            reject(value) 
          }
        })
        ```
        
- `resolve` 함수를 호출하면, `Promise` 상태가 `fulfilled`로 변경된다. 이후, `then(onFulfilled)` 메서드에 의해 등록된 `onFulfilled` 콜백 함수들이 등록 순서대로 수행된다. 이 때, `Promise` 결과값이 `onFulfilled(result)` 인자로 사용된다.
- `resolve` 함수를 호출하면, `Promise` 상태가 `rejected`로 변경된다. 이후, `then(onFulfilled, onRejected)` 메서드에 의해 등록된 `onRejected` 콜백 함수들이 등록 순서대로 수행된다. 이 때, `Promise` 결과값이 `onRejected(result)` 인자로 사용된다.

<h4> [🧑🏻‍💻 MyPromise에 mocking 해보자] </h4>
- promise 성공, 실패시 호출되는 `resolve`, `reject` 함수를 `onResolved`, `onRejected` 함수로 구현하였다.
- 후속 처리 메서드인 `then`, `catch`를 통해 등록된 콜백 함수들은 `MyPromise`의 `thenCbs`, `catchCbs` 배열에 저장되어 MyPromise의 `onFulfilled`, `onRejected` 함수가 호출 될 때 forEach 문에  의해 실행된다.
- 함수 내부에서는 비동기 처리 상태와 비동기 처리 결과를 변경한다. 비동기 처리 상태값에 따라 선택적으로 콜백 함수를 호출하는 부분을 `runCallbacks` 함수로 분리하였다.
    
    ```javascript
    class MyPromise {
      ...
      #thenCbs = []
      #catchCbs = []
    
    	#runCallbacks() {
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
      }
    
      #onFulfilled(result) {
          if (this.#state !== STATE.PENDING) return // 동일 then 내 resolve 재호출 방지
    
          this.#result = result
          this.#state = STATE.FULFILLED
          this.#runCallbacks()
      }
    
      #onRejected(result) {
          if (this.#state !== STATE.PENDING) return // 동일 then 내 reject 재호출 방지
    
          this.#result = result
          this.#state = STATE.REJECTED
          this.#runCallbacks()
      }
    }
    ```
    
</details>

<details> <summary> <h3> ✅ Promise 후속처리 메서드는 항상 Promise를 반환하기 때문에 Promise 메서드 체이닝이 가능하다.
 </h3> </summary>
 
<h4> [🔍Javascript Promise 구현 방식을 살펴보자] </h4>

- Javascript에서 `promise` 후속처리 메서드인 `then`, `catch`, `finally`는 언제나 새로운 `promise`를 생성해 반환해준다. 이처럼 후속처리 메서드가 항상 `promise`를 반환된다는 약속을 지키기 때문에, 개발자는 `promise` 후속 처리 메서드들을 체이닝해 사용할 수 있다.
    - 후속 처리 메서드의 콜백함수가 (1) `promise`를 반환하는 경우, 해당 `promise`를 그대로 반환한다.
    - 반면, (2) 콜백함수가 promise가 아닌 값을 반환하면, 해당값을 `resolve` 또는 `reject` 함수로 감싸주면 `promise` 형태로 반환된다.

<h4> [🧑🏻‍💻 MyPromise에 mocking 해보자] </h4>

- 앞서 만든 MyPromise의 `then`, `catch`, `finally` 메서드가 항상 promise를 반환하도록 변경해주자.
- 우선, 메서드를 변경하기 전에 `MyPromise`의 `onFulfilled`와 `onRejected`를 생성자 함수인 `MyPromise`의 `this`에 바인딩해주어야 한다.
        
    ```javascript
    class MyPromise {
      #thenCbs = []
      #catchCbs = []
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
    }
    ```
        
- `then` 메서드에서 `MyPromise 생성자 함수`를 호출하고 그 결과 생성된 `MyPromise 인스턴스`를 반환하도록 수정해보자.
    - `thenCbs`와 `catchCbs` 배열에 콜백 함수를 추가하는 코드도 `resolve`, `reject` 함수로 처리 결과를 wrapping 해준다.
    - 이 때, `then` 메서드에서 인자를 하나만 받는 경우를 대비하여, `undefined`에 따른 분기 처리를 해주어야 에러가 발생하지 않는다.

    ```javascript
    class MyPromise {
        ...

        then(thenCb, catchCb) {
            return new MyPromise((resolve, reject) => {
              this.#thenCbs.push((result) => {
                if (thenCb == undefined) { // then(undefined, catchCb) 처리
                  resolve(result)
                  return
                }

                try {
                  resolve(thenCb(result)) 
                } catch (e) {
                  reject(e)            // then 내부에서 에러가 있으면 바로 rejected 상태로 변경됨.
                }
              })

              this.#catchCbs.push((result) => {
                if (catchCb == undefined) { // then(thenCb) 처리
                  reject(result)
                  return
                }

                try {
                  resolve(catchCb(result)) 
                } catch (e) {
                  reject(e)
                }
              })
            })
          }
        }
    }
    ```

- `catch` 메서드와 `finally` 메서드는 return 문만 추가하여 `promise`를 리턴하도록 해주면 된다.
        
    ```javascript
    class MyPromise {
        ...
        catch(cb) {
        return this.then(undefined, cb)
      }

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
    }
    ```
        
- 이와 같은 형태로 `MyPromise`의 비동기 후속 처리 메서드인 `then`, `catch` , `finally` 가 모두 `MyPromise`를 리턴하게 해주면 `Promise` 체이닝 테스트 코드를 모두 통과할 수 있다.
    
    <img src="https://user-images.githubusercontent.com/48196721/215745341-936ff601-1dcd-4c52-ba38-83e3b7a43977.png" width="450px" title="테스트 코드" alt="테스트 결과"></img>


</details>


<details> <summary> <h3> ✅ Promise 후속처리 메서드의 콜백함수는 microtask queue에 등록된다. </h3> </summary>

<h4> [🔍Javascript Promise 구현 방식을 살펴보자] </h4>

- Javascript에서 비동기 처리를 위해 `Promise` 내부에 등록된 콜백함수들은 `microtask queue`에 들어가 차례를 기다린다.

    ![image](https://user-images.githubusercontent.com/48196721/215739856-15379f3f-28a9-4a15-81c2-c2b0c136921d.png)

- 이후 Javascript `Event loop`에 의해 콜스택이 비어있는 경우, `microtask queue`에 대기중인 콜백 함수들이 `call stack`으로 이동되어 실행된다.
    - `microtask queue`의 우선순위는 `event queue(= callback queue, task queue)`의 우선순위보다 높다.

<h4> [🧑🏻‍💻 MyPromise에 mocking 해보자] </h4>

- 지금까지는 비동기 처리에 대한 고려 없이 `MyPromise` 코드를 작성하였다.
- 비동기 처리 코드가 성공하여 Javascript의 `Promise`에서 `resolve`, `reject`를 호출하였을 때, `microtask queue`에 콜백 함수들이 등록되는 과정을 mocking 해보자.
- 콜백 함수들을 실제 실행하는  `runCallbacks` 함수 내부 코드를  [`queueMicrotask()` 함수](https://developer.mozilla.org/ko/docs/Web/API/queueMicrotask)로 감싸주면 간단하게 `microtask queue`에 콜백 함수들을 등록해줄 수 있다.
    
    ```javascript
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
    ```
    
</details>


<details> <summary> <h3> ✅ Promise는 이 외에도 다양한 static method들을 제공하여 간단히 비동기 후속 처리를 할 수 있도록 도와준다. </h3> </summary>


<h4> [🔍Javascript Promise 구현 방식을 살펴보자] </h4>

- Javascript `Promise`을 콜백 패턴의 `syntactic sugar + alpha`  라고 볼 수 있다. 기존 콜백 패턴에서 지원하지 않던 비동기 코드 후속 처리에 사용할 수 있는 편리한 `static methods`를 지원해주기 때문이다.
       
    | static method | 기능 |
    | --- | --- |
    | Promise.resolve(value) | {state: fulfilled, result: value} 형태의 Promise 객체 반환 |
    | Promise.reject(value) | {state: rejected, result: value} 형태의 Promise 객체 반환 |
    | Promise.all(Iterable) | Promise를 요소로 갖는 배열을 인자로 받음. (1) Promise 배열 내의 Promise가 모두 fulfilled되거나 (2) 그 중 하나라도 rejected 된 경우 함수를 종료하고, 처리 결과를 배열에 담아 반환 |
    | Promise.allSettled(Iterable) | Promise를 요소로 갖는 배열을 인자로 받음. Promise 배열 내의 Promise가 모두 settled 되면 함수를 종료하고, 처리 결과를 배열에 담아 반환. |
    | Promise.race(Iterable) | Promise를 요소로 갖는 배열을 인자로 받음. Promise 배열 내의 Promise 중 하나라고 settled 되면 함수 종료함. 가장 먼저 settled가 된 Promise만 반환. |
    | Promise.any(Iterable) | Promise를 요소로 갖는 배열을 인자로 받음. (1) Promise 배열 내의 Promise가 모두 rejected 되거나 (2) 그 중 하나라도 fulfilled 된 경우 함수를 종료하고, 처리 결과를 배열에 담아 반환 |

<h4> [🧑🏻‍💻 MyPromise에 mocking 해보자] </h4>

- `MyPromise`에도 `static methods`를 추가해보자.
    - `resolve`, `reject`는 `Promise`를 차용해 간략히 구현하자.
            
        ```javascript
        class MyPromise {
            ...
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
        }
        ```

    - `all` 메서드에서는 각 `Promise`가 `fulfilled` 될 때마다 `completedPromises`의 수와 비교하여, `promises` 배열이 모두 수행되었는지 확인해준다. 만약, 하나라도 `reject`된 경우, 바로 종료할 수 있도록, `catch` 메서드에 `reject`를 등록해준다.

        ```javascript
        class MyPromise {
            ...
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
        }
        ```

    - `allSettled` 메서드에서는 처리 결과 배열의 내부 `Promise`가 `onFulfilled`의 경우, {status, result}, `onRejected` 된 경우 {status, reason} 형태여야함에 유의해 코드를 작성한다.

        ```javascript   
        class MyPromise {
            ...
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
        }
        ```

    - `race` 메서드는 가장 먼저 처리된 `Promise`만 반환됨에 유의해 코드를 작성한다.

        ```javascript
        class MyPromise {
            ...
            static race(promises) {
            return new MyPromise((resolve, reject) => {
              promises.forEach((promise) => {
                promise.then(resolve).catch(reject)
              })
            })
          }
        }
        ```

    - `any` 메서드는 `all` 메서드와 반대로 동작한다.

        ```javascript
        class MyPromise {
            ...
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
        ```
            
    - 위와 같이 코드를 작성하면, static method에 대한 테스트 코드 또한 모두 통과할 수 있다.
        <img src="https://user-images.githubusercontent.com/48196721/215739505-765ac1b4-8b5e-4808-a826-8851d429d2f9.png" width="450px" title="테스트 코드" alt="테스트 결과"></img>

</details>
    


## 2. Promise 내부 동작 방식 🏗️

- Promise를 직접 코드로 작성해보니, 이제야 Promise가 무엇인지 와닿는다. 코드를 치며 이해하게된 Promise의 내부 동작 방식을 간단히 요약해보았다.
    
>    💡 Promise = 비동기 처리를 위해 state, result, 여러 callback 배열을 관리하는 객체
>    
>    1. Promise 후속 처리 메서드 then, catch, finally를 통해 등록한 콜백함수는 Promise 내부에 배열 형태로 저장되고, Promise state가 변경되면 해당 상태에 따라 선택적으로 forEach문을 통해 callback 배열을 수행한다. 각 콜백의 인자로 result가 들어간다. 이 때, 콜백 함수들은 microtask queue에 등록된다. 
>    
>    2. Promise 코드를 보면, 후속 처리 메서드는 모두 Promise를 반환한다. 덕분에 개발자는 Promise 메서드 체이닝을 수행할 수 있다.
>    
>    3. Promise는 비동기 처리를 쉽게 할 수 있도록 Promise 동시 처리가 가능한 all, allSettled, race, any와 같은 static methods를 지원한다.
> 



## 3. Promise가 해결한 문제 🔧

- 이제 Promise 내부 동작 방식에 대해 파악했으니, ES6에서 Promise를 도입함으로써 해결하고자 했던 문제가 무엇인지에 대해 짚어보자.

<details> <summary> <h3> ✅ Javascript의 비동기 처리 패턴은 왜 도입되었는가 </h3> </summary>

- Javascript는 `single thread` 언어다. 즉, 단 하나의 `call stack`을 가지고 동작한다. 비동기 처리 방식은 필연적으로 다중 쓰레드가 필요하기 때문에, Javascript 환경에서는 코드의 동기적 실행만 가능하다.
- 하지만 모든 코드를 동기적으로 수행할 경우, `blocking`으로 인한 성능 저하가 발생할 수 밖에 없다. 서버에서 응답을 받아오는 등 시간이 오래 걸리는 선행 task가 끝나야 이후 task를 수행할 수 있기 때문이다.
- 이를 해결하기 위해 Javascript는 웹 브라우저나 Node.js 실행 환경의 `Web API`와 `Event loop`의 힘을 빌려 비동기 처리를 수행한다.
- 하지만 **비동기 방식**을 도입함에 따라 `non-blocking`으로 인해 **실행 순서가 보장되지 않는다**는 태생적인 문제가 발생했다.
- 이러한 상황 속에서 **Javascript는 비동기에서 함수의 실행 순서를 보장하기 위해 여러 장치를 도입**하였으며, 그 중 대표적인 패턴이 (1) callback (2) Promise (3) async/await 이다.

</details>

<details> <summary> <h3> ✅ Callback 패턴: (1) 가독성 저하 (2) 에러 처리 이슈 </h3> </summary>

- 콜백 패턴은 Javascript에서 **비동기 코드의 실행 순서를 보장**하기 위해 사용하는 전통적인 장치이다.
    - 비동기 처리 함수 내에서 비동기 결과가 나온 이후 콜백 함수를 호출해 비동기 후속 처리를 수행한다.
- 콜백 패턴은 비동기 처리 코드가 중첩될 경우, **콜백 헬**이 발생해 **가독성이 저해**되는 문제를 안고 있다.
    
    ```javascript
    // 비동기 함수
    const get = (url, callback) => {
    	const xhr = new XMLHttpRequest();
    	xhr.open('GET', url);
    	xhr.send()
    
    	xhr.onload = () => {
    		if (xhr.status === 200) {
    			callback(JSON.parse(xhr.response))
    		}
    		else {
    			console.error(`${xhr.status} ${xhr.statusText}`)
    		}
    	}
    }
    
    // callback hell
    get('/step1', a => {
    	get(`/step2/${a}`, b => {
    		get(`/step3/${b}`, c => {
    			get(`/ step4 / ${c}`, d => {
    				console.log(d);
    			})
    		})
    	})
    })
    ```
    
- Javascript에서 **에러는 호출자 방향으로 전달**된다.
    - 동기적 작업에서는 에러가 발생하면, 이를 처리할 `try… catch…` 절을 만날때까지 `call stack`을 거슬러 올라가서(**bubbling up the call stack**) 예외가 처리된다.
    - 반면, 비동기 작업에서는 호출자가 `call stack`에 존재하지 않기 때문에 `try… catch…`를 통해 호출자에게 예외를 전달 할 수 없다는 태생적 한계가 있다.
    
    ```javascript
    try {
      setTimeout(() => {
        throw new Error("Error!")
      }, 5000)
    } catch (e) {
      console.error(e) // error catch 불가
    }
    ```

</details>

<details> <summary> <h3> ✅ Promise 패턴: (1) 메서드 체이닝을 통해 가독성 문제 해결 (2) catch를 통한 에러 처리 </h3> </summary>

- 앞서 살펴본 콜백 패턴의 (1) 가독성 저하 (2) 에러 처리 이슈를 해결하기 위해 ES6에 도입된 비동기 처리 장치가 바로 `Promise`이다.
- 우선, `Promise`는 중첩된 콜백을 **선형에 가까운 프라미스 체인**으로 바꾸어 **가독성을 향상** 시켜준다.
    - 직접 구현한 `MyPromise` 코드에서 살펴볼 수 있듯, [✅ Promise 후속처리 메서드는 항상 Promise를 반환하기 때문에 Promise 메서드 체이닝이 가능하다.](https://github.com/JSDeepDive/CustomPromise/edit/main/README.md#-promise-%ED%9B%84%EC%86%8D%EC%B2%98%EB%A6%AC-%EB%A9%94%EC%84%9C%EB%93%9C%EB%8A%94-%ED%95%AD%EC%83%81-promise%EB%A5%BC-%EB%B0%98%ED%99%98%ED%95%98%EA%B8%B0-%EB%95%8C%EB%AC%B8%EC%97%90-promise-%EB%A9%94%EC%84%9C%EB%93%9C-%EC%B2%B4%EC%9D%B4%EB%8B%9D%EC%9D%B4-%EA%B0%80%EB%8A%A5%ED%95%98%EB%8B%A4-)
    - 즉, `then`, `catch`, `finally` 메서드를 통해 **콜백 함수를 연이어 등록**할 수 있기 때문에 비동기 중첩으로 인한 콜백헬이 발생하지 않는다.
    
    ```javascript
    myPromise()
      .then((message) => {
        console.log("Success case1: ", message)
      })
    	.then((message) => {
        console.log("Success case2: ", message)
      })
      .catch((error) => {
        console.log(error.name, error.message)
      })
    	.finally(() => {
    		consoel.log('End')
    	})
    ```
    
- `Promise`는 비동기 작업의 태생적 한계인 에러 처리의 어려움을 `catch` 메서드를 통해 해결한다.
    - `Promise` 기반 비동기 작업은 예외를 `then(thenCb, catchCb)`의 `catchCb`에 전달한다.
    - `Promise` 체이닝에서 발생한 에러는 `catch()`를 만날 때까지 체인을 따라 내려간다(**trickling down the chain**).
        - 이 때, `then()` 메서드 내부에서 동기적 `throw` 문으로 발생된 `Error` 객체까지도 `catch()` 메서드에 의해 처리할 수 있다.

- <details> <summary> [더 나아가기] Q. Promise then(onSuccess, onFailure)와 then(onSuccess).catch(onFailure)는 무엇이 다를까? </summary> 
    
    [promise.then(f, f) vs promise.then(f).catch(f) 는 무엇이 다를까?](https://yceffort.kr/2021/07/promise-then-f-f-vs-promise-catch)  
    - `catch(onFailure)`를 사용하는 경우, `then` 메서드 내부에서 발생한 `reject`에 대한 예외 처리가 가능하다. 즉,
    - 따라서, 내가 잠재적으로 처리하고 싶은 명확한 failure가 있다면, `promise.then(oSuccess, onFailure)`를 쓰는 것이 좋다.
    - 반면 `promise.catch(onFailure)`는 개발자가 예측하지 못한 경우를 포함한 모든 에러를 처리할 수 있다.
</details>

</details>



## 4. Promise의 한계 👿

- 정리하면, Promise는 Javascript 비동기 작업의 실행 순서를 보장하기 위해 전통적으로 사용하던 callback 패턴의 **가독성과 에러 처리 부분을 개선**한 비동기 처리 패턴이다.
- 더 나아가 [✅ Promise는 이 외에도 다양한 static method들을 제공하여 간단히 비동기 후속 처리를 할 수 있도록 도와준다.](https://github.com/JSDeepDive/CustomPromise/blob/main/README.md#-promise%EB%8A%94-%EC%9D%B4-%EC%99%B8%EC%97%90%EB%8F%84-%EB%8B%A4%EC%96%91%ED%95%9C-static-method%EB%93%A4%EC%9D%84-%EC%A0%9C%EA%B3%B5%ED%95%98%EC%97%AC-%EA%B0%84%EB%8B%A8%ED%9E%88-%EB%B9%84%EB%8F%99%EA%B8%B0-%ED%9B%84%EC%86%8D-%EC%B2%98%EB%A6%AC%EB%A5%BC-%ED%95%A0-%EC%88%98-%EC%9E%88%EB%8F%84%EB%A1%9D-%EB%8F%84%EC%99%80%EC%A4%80%EB%8B%A4-) 이러한 맥락에서 **Promise = callback 패턴의 syntatic sugar + alpha** 라고 정리해 볼 수 있다.
- 하지만 인간의 욕심은 끝이 없다… 개발자들은 비동기 처리 패턴이 마치 동기 코드 수준의 가독성을 가지길 원했고, 이러한 요구 하에 `async/await` 패턴이 등장하게 된다. `async/await` 패턴은 `Generator`를 통해 구현되어 있어 `try… catch…`에 의한 비동기 에러 처리도 가능하다.
