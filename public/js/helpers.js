function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function zeropad( s, n ) {
  n = n || 2;
  s = String(s);
  while (s.length < n) {
    s = '0' + s;
  }
  return s;
}

function ymd_to_s( ymd ) {

  var d = new Date();
  d.setFullYear(ymd.substr(0,4));
  d.setDate(1); // allow for more days in month than sensible
  d.setMonth(Number(ymd.substr(4,2)) - 1);
  d.setDate(ymd.substr(6,2));
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);

  return Math.floor(d.getTime() / 1000);

}

function ymd_to_date( ymd ) {

  var d = new Date();
  d.setFullYear(ymd.substr(0,4));
  d.setDate(1); // allow for more days in month than sensible
  d.setMonth(Number(ymd.substr(4,2)) - 1);
  d.setDate(ymd.substr(6,2));
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  return d;

}

function s_to_ymd( s ) {
  var d = new Date(s * 1000);
  var yyyy = d.getFullYear().toString();
  var mm = (d.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = d.getDate().toString();
  return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
}

function sensible(min, max) {

  var eps = 0.001;

  if(min < eps && max < eps){
    return [0, 0];
  }

  var range = max-min;

  if(range < eps)
    {
      return [min-1,max+1];
    }

  var orderf = -0.9 + Math.log(range)/Math.log(10);
  var order = Math.floor(orderf);
  var rem = orderf-order;
  var grid = Math.pow(10, order);

  if(rem > 0.7) {
    grid *= 5;
  } else if (rem > 0.3) {
    grid *= 2;
  }

  return [Math.floor(min/grid)*grid, Math.ceil(max/grid)*grid];

}
