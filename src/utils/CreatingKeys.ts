class CreatingKeys {
  keyRecoveryPass() {
    const symbols = "ABDEFGHKMNPQRSTWXZ123456789";
    let key = "";
    for (let i = 0; i < 4; i += 1) {
      const position = Math.floor(Math.random() * symbols.length);
      key += symbols.substring(position, position + 1);
    }
    return key;
  }
}
export default new CreatingKeys();
