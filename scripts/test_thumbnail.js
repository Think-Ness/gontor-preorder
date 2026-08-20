async function testThumbnail() {
  try {
    const res = await fetch('https://drive.google.com/thumbnail?id=10ZstNhNccaknXZ2PwCkJbYQy-Nz4bMmG&sz=w800');
    console.log('Status:', res.status);
    console.log('Headers:', res.headers);
  } catch (err) {
    console.error(err);
  }
}
testThumbnail();
