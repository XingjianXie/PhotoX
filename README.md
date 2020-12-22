# PhotoX
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmark07x%2FPhotoX.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmark07x%2FPhotoX?ref=badge_shield)

**PhotoX is used to manage photos for Year Book Club of CNU High School.**  
We support upload and download photos, and we have a simply user manage system. The download of photos will be recorded so that we can make sure a photo is used for only one time.  

![image](https://github.com/mark07x/PhotoX/blob/stable/README_RESOURCES/MAIN.png)

## API Document

### Basic Convention
#### Request
```
{
    max, // Max Number of Record Should Be Returned
    pg, // Page Number
    wd, // Search Key
    ... // Other Information Required
}
```
#### Response
```
{
    code, // 200 | 302 | 4XX | 500
    msg, // Message | Error Message
    inf, // Extra Information | Error Extra Information
    url, // 302 Redirect Url
    content, // Requested Content
    total, // Total Length of Search Result (Before the Limitation of Request.max)
    ... // Other Information Returned
}
```

## Build and setup server
See [PhotoX](https://github.com/mark07x/PhotoX/tree/stable)

## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmark07x%2FPhotoX.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmark07x%2FPhotoX?ref=badge_large)
