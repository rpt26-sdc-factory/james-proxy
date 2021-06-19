import http from 'k6/http';
import { sleep } from 'k6';

export default function () {

  var getRandomCourse = () => {
    return Math.random() < .85 ?
      (Math.floor(Math.random() * 1000000) + 9000000) :
      (Math.floor(Math.random() * 10000000))
  }

  http.get('http://localhost:3000/' + getRandomCourse());
  sleep(1);
}