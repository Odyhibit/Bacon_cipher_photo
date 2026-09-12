# Bacon Cipher Group Photo

A small web tool for hiding and decoding Bacon cipher messages in a Friedman-inspired group portrait.

The project was inspired by William F. Friedman’s “Knowledge is Power” group photograph, where people facing forward or sideways encode a message using Francis Bacon’s biliteral cipher. A good account of the story is William H. Sherman’s Cabinet article, [“How to Make Anything Signify Anything”](https://www.cabinetmagazine.org/issues/40/sherman.php).

## Try it out
https://odyhibit.github.io/Bacon_cipher_photo/

## What It Does

- `web_version.html` generates a group image from a secret message or raw binary bits.
- `photo_decoder.html` decodes generated images by matching each figure position against the included front-facing and side-facing figure templates.
- The `images/` folder contains the bundled figure and background images used by both pages.

In the generated image:

- `0` = front-facing figure
- `1` = side-facing figure
- 5 bits = 1 Bacon cipher letter


```

## Files

- `web_version.html` - browser-based image generator
- `photo_decoder.html` - browser-based decoder
- `bacon_group_composer.py` - original Python image composer
- `images/` - default figures and background

## Notes

The current image set is intentionally small: three front-facing figures and three side-facing figures. The generator avoids immediate same-row repeats where possible, but a wider image set would improve variety.
