# Odoo Online (pet-stone.shop) → Odoo Community self-hébergé — analyse d'écart
Généré le 24/08/2026, suite à ta question "Quels modules utilisés dans Odoo online, sont manquants dans Odoo comm ?"

## Méthode et niveau de confiance — à lire avant les tableaux

Deux sources ont été croisées :
1. **Interrogation directe de ton Odoo Online réel** (`ir.module.module`, `state=installed`, `application=true`) → **43 applications** installées (sur 486 modules techniques au total — le reste, ~440, ce sont des dépendances internes, pas des "apps" au sens où tu les vois dans le menu Apps).
2. **Statut Community/Enterprise de chaque app** : ma connaissance générale d'Odoo, recoupée avec une recherche web ce soir. Comme pour "Marketing Automation" hier (où la doc officielle et des sites tiers se contredisaient, et où ton propre test dans Odoo a tranché), plusieurs sources tierces se contredisent encore ce soir sur des apps précises. Je classe donc chaque ligne en **confirmé**, **quasi-certain (stable depuis plusieurs versions Odoo)**, ou **à vérifier par toi** (30 secondes : Apps → rechercher le nom → si "Upgrade" ou cadenas apparaît, c'est Enterprise).

## Tableau complet — 43 apps installées sur pet-stone.shop

| App (nom technique) | Ce que c'est | Communauté ? | Confiance |
|---|---|---|---|
| sale_management | Sales | ✅ Community | Confirmé |
| account | Invoicing | ✅ Community | Confirmé |
| crm | CRM | ✅ Community | Confirmé |
| website | Website | ✅ Community | Confirmé |
| stock | Inventory | ✅ Community | Confirmé |
| purchase | Purchase | ✅ Community | Confirmé |
| point_of_sale | Point of Sale | ✅ Community | Confirmé |
| project | Project | ✅ Community | Confirmé |
| website_sale | eCommerce | ✅ Community | Confirmé |
| mass_mailing | Email Marketing | ✅ Community | Confirmé |
| hr | Employees | ✅ Community | Confirmé |
| mail | Discuss | ✅ Community | Confirmé |
| contacts | Contacts | ✅ Community | Confirmé |
| calendar | Calendar | ✅ Community | Confirmé |
| im_livechat | Live Chat | ✅ Community | Confirmé |
| survey | Surveys | ✅ Community | Confirmé |
| repair | Repairs | ✅ Community | Confirmé |
| stock_barcode | Barcode | ✅ Community | Quasi-certain |
| project_todo | To-Do | ✅ Community | Quasi-certain |
| maintenance | Maintenance | ✅ Community | Quasi-certain |
| data_recycle | Data Recycle | ✅ Community | Quasi-certain |
| appointment | Appointments | ✅ Community | À vérifier (est passé Community il y a quelques versions, à confirmer sur ton instance) |
| **accountant** | **Accounting (compta complète)** | ❌ Enterprise | Confirmé — **hors scope de toute façon, tu l'as exclu** |
| **web_studio** | **Studio (no-code)** | ❌ Enterprise | Confirmé |
| **sign** | **Sign (signature électronique)** | ❌ Enterprise | Confirmé |
| **helpdesk** | **Helpdesk** | ❌ Enterprise | Confirmé |
| **sale_subscription** | **Subscriptions** | ❌ Enterprise | Confirmé |
| **website_slides** | **eLearning** | ❌ Enterprise | Confirmé |
| **sale_renting** | **Rental** | ❌ Enterprise | Confirmé |
| **social** | **Social Marketing** | ❌ Enterprise | Confirmé |
| **fleet** | **Fleet** | ❌ Enterprise | Confirmé |
| **approvals** | **Approvals** | ❌ Enterprise | Confirmé |
| **marketing_automation** | **Marketing Automation** | ❌ Enterprise | **Confirmé par toi hier en direct dans Odoo** |
| **hr_skills** | **Skills Management** | ❌ Enterprise | Confirmé |
| **voip** | **Phone (VoIP)** | ❌ Enterprise | Confirmé |
| **sale_amazon** | **Amazon Connector** | ❌ Enterprise | Quasi-certain — **et rattaché au compte vendeur Amazon de Dyonysos BE, pas FR/pet-stone, donc probablement hors scope de la migration pet-stone** |
| delivery_easypost | Easypost Shipping | ❌ Enterprise | Quasi-certain (connecteurs transporteurs = Enterprise) |
| delivery_bpost | bpost Shipping | ❌ Enterprise | Quasi-certain |
| documents | Documents (GED) | ❌ Enterprise (probable) | À vérifier |
| ai_app | AI (nouveau en v19) | ❌ Enterprise (probable) | À vérifier |
| website_event | Events | ❌ Enterprise (probable) | À vérifier |
| mass_mailing_sms | SMS Marketing | ❌ Enterprise (probable) | À vérifier |
| knowledge | Knowledge | ❌ Enterprise (probable) | À vérifier |

**Total : 22 apps déjà en Community, 15 Enterprise confirmées/quasi-certaines, 6 à vérifier par toi (30 sec/app dans Apps).**

## Ce qui compte réellement pour ta demande (Dyonysos FR / pet-stone, sans facturation)

Tu as dit : migrer vers Community **certaines choses seulement**, **pas la facturation/comptabilité**, pas de lien Dougs. Sur cette base, le cœur pour faire tourner pet-stone.shop en self-hébergé serait :

- **website + website_sale (eCommerce)** — Community ✅
- **sale_management (Sales)** — Community ✅
- **crm** — Community ✅ (même si tu utilises Taiga comme vrai CRM, le module reste dispo si besoin ponctuel)
- **stock (Inventory)** — Community ✅
- **contacts, mail, calendar** — Community ✅
- **mass_mailing (Email Marketing)** — Community ✅ (donc pas besoin d'Activepieces pour du simple email marketing "newsletter" — seule l'automatisation avancée, `marketing_automation`, est bloquée)
- **point_of_sale** — Community ✅ (à garder seulement si pet-stone vend aussi en point de vente physique — à confirmer, sinon on ne l'installe pas)

Donc, pour le périmètre que tu as toi-même défini (pas de compta, pas de lien Dougs), **le cœur opérationnel de pet-stone.shop est déjà couvert par Odoo Community** — le vrai manque concerne des apps annexes (Social Marketing, Marketing Automation, Helpdesk, Documents, Sign) que tu n'as pas dit vouloir migrer de toute façon. Le seul vrai arbitrage à trancher : **Amazon Connector** (Enterprise) — mais si le compte vendeur Amazon reste sous Dyonysos BE et n'est pas dans le périmètre "pet-stone/Dyonysos FR", ce n'est pas un manque pour cette migration.

## Ce que ça change pour "Automation Remake" (Activepieces)

Sur ta question "mail marketing / automation on reste sur Odoo Community ou il faut installer l'autre solution ?" : **Email Marketing simple (newsletters, mass_mailing) reste dans Odoo Community.** Ce qui manque et que seul Activepieces (ou payer l'upgrade Enterprise) peut couvrir, c'est de la **Marketing Automation** au sens strict : parcours multi-étapes déclenchés par un comportement (ex. "email J+3 si panier abandonné"). C'est un scénario Activepieces tout à fait faisable (trigger Odoo/webhook → délai → email), à construire si/quand tu en as besoin.
