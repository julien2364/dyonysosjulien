#!/usr/bin/env python3
"""T034 — Générateur de pages apps pour la migration dyonysos.fr vers Odoo.

Lit migration-odoo/manifeste-pages-apps.json et produit, sur stdout, un XML
<odoo><data> prêt à être envoyé par XML-RPC (website.page + dyo.app.page),
une page par application.

Sécurité : mode DRY-RUN par défaut, aucune connexion réseau.
--execute exigerait un accord écrit de Julien (aucune écriture dans Odoo
n'est faite dans ce lot) ; le script ne contient aucune clé ni identifiant.
"""
import argparse
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

MANIFESTE = Path(__file__).resolve().parent.parent / "manifeste-pages-apps.json"


def charger_manifeste():
    data = json.loads(MANIFESTE.read_text(encoding="utf-8"))
    apps = data["apps"]
    slugs = [a["slug"] for a in apps]
    if len(slugs) != len(set(slugs)):
        raise SystemExit("Erreur : slugs en double dans le manifeste")
    for a in apps:
        for champ in ("slug", "name", "summary", "price", "version", "license"):
            if champ not in a:
                raise SystemExit(f"Erreur : champ manquant '{champ}' pour {a.get('slug')}")
    return apps


def esc(valeur):
    return "" if valeur is None else str(valeur)


def generer_xml(apps):
    odoo = ET.Element("odoo")
    data = ET.SubElement(odoo, "data", {"noupdate": "0"})
    for a in apps:
        page = ET.SubElement(data, "record", {"id": f"dyo_app_page_{a['slug'].replace('-', '_')}", "model": "website.page"})
        ET.SubElement(page, "field", {"name": "name"}).text = a["name"]
        ET.SubElement(page, "field", {"name": "url"}).text = f"/applications/{a['slug']}"
        ET.SubElement(page, "field", {"name": "is_published"}).text = "True"
        ET.SubElement(page, "field", {"name": "view_arch"}).text = (
            f'<t t-call="website.layout"><div id="wrap" class="oe_structure">'
            f'<section class="s_title"><div class="container"><h1>{esc(a["name"])}</h1></div></section>'
            f'<section class="s_text_block"><div class="container"><p>{esc(a["summary"])}</p></div></section>'
            f"</div></t>"
        )
        rec = ET.SubElement(data, "record", {"id": f"dyo_app_{a['slug'].replace('-', '_')}", "model": "dyo.app.page"})
        ET.SubElement(rec, "field", {"name": "name"}).text = a["name"]
        ET.SubElement(rec, "field", {"name": "slug"}).text = a["slug"]
        ET.SubElement(rec, "field", {"name": "technical_name"}).text = esc(a.get("technical"))
        ET.SubElement(rec, "field", {"name": "group_title"}).text = esc(a.get("groupTitle"))
        ET.SubElement(rec, "field", {"name": "summary"}).text = esc(a.get("summary"))
        ET.SubElement(rec, "field", {"name": "price"}).text = esc(a.get("price"))
        ET.SubElement(rec, "field", {"name": "currency"}).text = esc(a.get("currency", "EUR"))
        ET.SubElement(rec, "field", {"name": "version"}).text = esc(a.get("version"))
        ET.SubElement(rec, "field", {"name": "license"}).text = esc(a.get("license"))
        ET.SubElement(rec, "field", {"name": "apps_url"}).text = esc(a.get("appsUrl"))
        ET.SubElement(rec, "field", {"name": "image"}).text = esc(a.get("image"))
        if a.get("video"):
            ET.SubElement(rec, "field", {"name": "video_youtube_id"}).text = a["video"]
    ET.indent(odoo)
    return ET.tostring(odoo, encoding="unicode")


def main():
    parser = argparse.ArgumentParser(description="Génère le XML des pages apps (dry-run par défaut).")
    parser.add_argument("--execute", action="store_true",
                        help="À DÉCISION JULIEN : n'est pas câblé dans ce lot, aucune connexion ne sera faite.")
    args = parser.parse_args()
    if args.execute:
        print("--execute refusé dans ce lot : aucune écriture dans Odoo (À DÉCISION JULIEN).", file=sys.stderr)
        raise SystemExit(2)
    apps = charger_manifeste()
    xml = generer_xml(apps)
    sys.stdout.write(xml + "\n")
    print(f"# {len(apps)} pages apps générées (dry-run, aucune connexion)", file=sys.stderr)


if __name__ == "__main__":
    main()
