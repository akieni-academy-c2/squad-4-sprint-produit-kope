import { describe, expect, it } from 'vitest';
import { imageOptimizer } from '../../vite.config.js';
import { repoPath } from '../support/repoRoot.js';

const REF_IDS = ['dJ$ULFcuzX43djbIEsCZPw', '$oUiuAXR7gZMKRQU56HW2w', 'aLISaAY6NSiJFT$6GdtrfA'];

/**
 * `emitFile` renvoie un identifiant de reference, pas un chemin. Utilise tel
 * quel comme URL, il produit un `src` du genre `dJ$ULFcuzX43djbIEsCZPw` : le
 * fichier 404, la reecriture SPA renvoie index.html en text/html, et l'image
 * ne s'affiche jamais. Les identifiants melangent lettres, chiffres, `_` et `$`,
 * d'ou des jetons numerotes plutot qu'un motif de recherche sur l'identifiant.
 */
describe("optimiseur d'images", () => {
  async function buildModule() {
    const plugin = imageOptimizer();
    const refIds = [...REF_IDS];
    const ctx = {
      emitFile: () => {
        if (refIds.length === 0) throw new Error('emitFile() depasse le jeu de references');
        return refIds.shift();
      },
      getFileName: (refId) => {
        if (typeof refId !== 'string') throw new TypeError(`reference invalide: ${refId}`);
        return `assets/what2-417-${refId}.webp`;
      },
    };

    const code = await plugin.load.call(ctx, repoPath('src/shared/assets/what2.png'));

    return { plugin, ctx, code };
  }

  it('n\'expose aucun identifiant de reference dans le module', async () => {
    const { code } = await buildModule();

    expect(code).not.toMatch(/[\w$]{20,}/);
    expect(code).toContain('__KOP_ASSET_0__');
  });

  it('remplace les jetons par le nom de fichier hache', async () => {
    const { plugin, ctx, code } = await buildModule();
    const chunk = { type: 'chunk', code };

    plugin.generateBundle.call(ctx, {}, { 'index.js': chunk });

    expect(chunk.code).not.toContain('__KOP_ASSET_');
    expect(chunk.code).toContain('assets/what2-417-dJ$ULFcuzX43djbIEsCZPw.webp 417w');
    expect(chunk.code).toContain('export default "assets/what2-417-dJ$ULFcuzX43djbIEsCZPw.webp"');
  });
});