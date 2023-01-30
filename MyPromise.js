/* Promise : 비동기 처리 상태(state)와 결과(result)를 저장한 객체.
 *           then, catch, finally 메서드를 통해 콜백 함수들을 받아 배열 형태로 저장해둔 객체.
 * 			     상태(state)가 변경되면, 상태값에 따라 어떤 콜백함수 배열을 호출할 것인지를 결정.
 *           		(1) fulfilled: thenCbs 호출
 * 							(2) rejected: catchCbs 호출.
 *           이 때 콜백함수 인자로는 result가 들어감.
 * 					 resolve 함수 호출 시 상태가 fulfilled로, reject 함수 호출 시 상태가 rejected로 변경됨.
 **/
