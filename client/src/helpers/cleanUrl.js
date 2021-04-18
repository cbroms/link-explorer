// remove anything variable from the url (protocol, trailing slash)
export const cleanUrl = (url) => {
  let newUrl = new URL(url);

  let cleaned = newUrl.hostname + newUrl.pathname;

  if (cleaned.charAt(cleaned.length - 1) === "/")
    cleaned = cleaned.substring(0, cleaned.length - 1);

  //   newUrl = newUrl.replace(/(^\w+:|^)\/\//, "");
  return cleaned;
};
