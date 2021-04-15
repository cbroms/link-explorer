// remove anything variable from the url (protocol, trailing slash)
export const cleanUrl = (url) => {
  let newUrl = url;

  if (url.charAt(url.length - 1) === "/")
    newUrl = url.substring(0, url.length - 1);

  //   newUrl = newUrl.replace(/(^\w+:|^)\/\//, "");
  return newUrl;
};
