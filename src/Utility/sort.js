export function normalSort(sort,data){
    return data.sort(function (a, b) {
      if (a[sort] < b[sort]) {
          return 1;
      } else if (a[sort]> b[sort]) {
          return -1;
      } else {
          return 0;
      }
    });
};  // จากมากไปน้อย

export function reverseSort(sort,data){
    return data.sort(function (a, b) {
      if (a[sort] < b[sort]) {
          return -1;
      } else if (a[sort]> b[sort]) {
          return 1;
      } else {
          return 0;
      }
    });
}; // จากน้อยไปมาก

