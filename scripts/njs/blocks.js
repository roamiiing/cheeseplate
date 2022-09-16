// this is internal script to be run through nginx
// to filter out all requests for cheeseplate analytics
function authorize(r) {
  if (r.method !== 'POST') {
    return r.internalRedirect('@plausible')
  }

  const body = r.requestBody

  try {
    const parsedBody = JSON.parse(body)

    if (
      [parsedBody.domain, parsedBody.d].indexOf('cheeseplate.talkiiing.ru') !==
      -1
    ) {
      return r.return(403, 'чеееееееееел')
    }
  } catch (e) {
    return r.internalRedirect('@plausible')
  }

  return r.internalRedirect('@plausible')
}

export default { authorize }
