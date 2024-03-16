exports.toggler = (current) => {
if (current == true) {
  current = false;
} else {
  current = true;
}
return Boolean(current);
}