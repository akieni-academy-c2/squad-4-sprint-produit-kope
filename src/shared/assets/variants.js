/**
 * Lit une image matricielle et ses variantes responsives.
 *
 * En production, le plugin `kop-image-optimizer` réencode le fichier en WebP
 * et ajoute l'export nommé `srcSet`. En développement il n'intervient pas : le
 * module ne contient alors qu'un `default`. Un `import { srcSet }` lèverait
 * une SyntaxError au chargement de la page ; l'accès par propriété renvoie
 * `undefined` et le navigateur se contente de l'image d'origine, servie par
 * le serveur de développement. D'où le passage par un import namespace, seul
 * forme qui fonctionne dans les deux modes.
 */
export function variants(module) {
  return { src: module.default, srcSet: module.srcSet };
}
