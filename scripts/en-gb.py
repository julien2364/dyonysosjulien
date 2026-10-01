#!/usr/bin/env python3
"""Normalise l'anglais du site en anglais britannique (décision Julien du 01/10/2026 : « uk »).

Ne touche QUE les sous-arbres `en` des données d'articles et de fiches (les autres langues ne sont
jamais lues : « color », « humor », « labor » sont corrects en espagnol). Ne modifie ni les URL, ni les
identifiants, ni les noms propres (mot à majuscule initiale précédé d'une majuscule, ou liste d'exclusion).

  python3 scripts/en-gb.py            # relevé seulement (aucune écriture)
  python3 scripts/en-gb.py --ecrire   # applique
"""
import json, re, sys
from collections import Counter

FICHIERS = ["api/_data/seo-article-bodies.json", "api/_data/seo-article-i18n.json"]

# Mots explicites (forme américaine -> britannique), minuscules ; la casse est reportée à l'écriture.
EXPLICITES = {
    "color": "colour", "colors": "colours", "colored": "coloured", "coloring": "colouring", "colorful": "colourful",
    "behavior": "behaviour", "behaviors": "behaviours", "behavioral": "behavioural",
    "favor": "favour", "favors": "favours", "favorite": "favourite", "favorites": "favourites", "favorable": "favourable",
    "honor": "honour", "honors": "honours", "labor": "labour", "neighbor": "neighbour", "neighbors": "neighbours",
    "neighborhood": "neighbourhood", "humor": "humour", "flavor": "flavour", "endeavor": "endeavour", "rumor": "rumour",
    "center": "centre", "centers": "centres", "centered": "centred", "centering": "centring",
    "catalog": "catalogue", "catalogs": "catalogues",
    "enroll": "enrol", "enrollment": "enrolment", "enrollments": "enrolments",
    "fulfill": "fulfil", "fulfills": "fulfils", "fulfillment": "fulfilment",
    "canceled": "cancelled", "canceling": "cancelling", "traveled": "travelled", "traveling": "travelling",
    "traveler": "traveller", "travelers": "travellers", "modeling": "modelling", "modeled": "modelled",
    "labeled": "labelled", "labeling": "labelling", "leveled": "levelled", "leveling": "levelling",
    "defense": "defence", "offense": "offence", "gray": "grey", "toward": "towards",
    "artifact": "artefact", "artifacts": "artefacts", "jewelry": "jewellery", "aluminum": "aluminium",
    "program": "programme", "programs": "programmes",
    "license": "licence", "licenses": "licences",
    "analyze": "analyse", "analyzes": "analyses", "analyzed": "analysed", "analyzing": "analysing",
    "analyzer": "analyser", "analyzers": "analysers", "paralyze": "paralyse",
    "skeptical": "sceptical", "resume": "CV", "resumes": "CVs", "judgment": "judgement", "acknowledgment": "acknowledgement",
}
# -ize, -izes, -ized, -izing, -ization(s), -izer(s) -> -is…
SUFFIXES = {"ize": "ise", "izes": "ises", "ized": "ised", "izing": "ising", "ization": "isation",
            "izations": "isations", "izer": "iser", "izers": "isers",
            "izational": "isational", "izable": "isable", "izability": "isability"}
PAS_IZE = {"size", "sizes", "sized", "sizing", "resize", "resized", "resizing", "prize", "prizes", "seize", "seized",
           "seizing", "capsize", "downsize", "downsized", "downsizing", "oversize", "oversized", "upsize", "outsize", "midsize", "citizen"}
# Sens à vérifier : « program » informatique, « license » verbe -> on garde l'américain/le verbe dans ces contextes.
GARDE_CONTEXTE = [
    (re.compile(r"\b(computer|software|affiliate) programs?\b", re.I), "program"),
    (re.compile(r"\blicen[cs](e|es|ed|ing)\b(?=\s+(to|the|your|our|a|an)\b)", re.I), "license-verbe"),
    (re.compile(r"\blicensed\b|\blicensing\b", re.I), "license-verbe"),
]
MOT = re.compile(r"[A-Za-z][A-Za-z-]*[A-Za-z]")


def britannique(mot):
    m = mot.lower()
    if m in EXPLICITES:
        return EXPLICITES[m]
    if m in PAS_IZE:
        return None
    for us, uk in sorted(SUFFIXES.items(), key=lambda x: -len(x[0])):
        if m.endswith(us) and len(m) - len(us) >= 3:
            return m[: -len(us)] + uk
    return None


def avec_casse(source, cible):
    if cible == "CV" or cible == "CVs":
        return cible
    if source.isupper():
        return cible.upper()
    if source[0].isupper():
        return cible[0].upper() + cible[1:]
    return cible


def traiter_texte(t, releve, ecrire):
    zones_gardees = []
    for rx, _ in GARDE_CONTEXTE:
        zones_gardees += [m.span() for m in rx.finditer(t)]

    def rempl(m):
        mot = m.group(0)
        debut, fin = m.span()
        jeton = re.search(r"\S*$", t[:debut]).group(0) + re.match(r"\S*", t[fin:]).group(0)
        if any(c in jeton for c in "/=_@") or "http" in jeton or ".com" in jeton:
            return mot  # URL, identifiant, adresse
        if any(a <= debut < b for a, b in zones_gardees):
            return mot
        parties = mot.split("-")
        sortie = []
        change = False
        for p in parties:
            uk = britannique(p) if p else None
            # noms de produits : « Analyzer+ » (marque) n'est jamais modifié
            if uk and t[fin:fin + 1] == "+":
                releve["MARQUE " + p] += 1
                uk = None
            if uk:
                releve[f"{p} -> {avec_casse(p, uk)}"] += 1
                sortie.append(avec_casse(p, uk)); change = True
            else:
                sortie.append(p)
        return "-".join(sortie) if (change and ecrire) else mot

    return MOT.sub(rempl, t)


def parcourir(x, releve, ecrire):
    if isinstance(x, str):
        return traiter_texte(x, releve, ecrire)
    if isinstance(x, list):
        return [parcourir(v, releve, ecrire) for v in x]
    if isinstance(x, dict):
        return {k: parcourir(v, releve, ecrire) for k, v in x.items()}
    return x


if __name__ == "__main__":
    ecrire = "--ecrire" in sys.argv
    total = Counter()
    for f in FICHIERS:
        brut = open(f, encoding="utf-8").read()
        retrait = len(re.match(r"\{\n( *)", brut).group(1)) if brut.startswith("{\n") else None
        d = json.loads(brut)
        releve = Counter()
        d["en"] = parcourir(d["en"], releve, ecrire)
        total += releve
        print(f"== {f} : {sum(v for k, v in releve.items() if not k.startswith('MARQUE'))} remplacements")
        if ecrire:
            with open(f, "w", encoding="utf-8") as h:
                json.dump(d, h, ensure_ascii=False, indent=retrait)
                if brut.endswith("\n"):
                    h.write("\n")
    for k, v in total.most_common():
        print(f"{v:5d}  {k}")
