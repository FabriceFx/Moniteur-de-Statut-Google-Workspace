/**
 * @fileoverview Script de surveillance du flux RSS Google Workspace Status Dashboard.
 * Détecte les nouveaux incidents et envoie une alerte par email.
 * @author Fabrice Faucheux
 * @version 2.0.0
 */

// CONFIGURATION
const CONFIG = {
  URL_FLUX: "https://www.google.com/appsstatus/dashboard/fr/feed.atom",
  CLE_IDS_VUS: "STATUT_GOOGLE_IDS_VUS",
  NAMESPACE_ATOM: "http://www.w3.org/2005/Atom"
};

/**
 * Fonction principale déclenchée par un trigger horaire.
 * Orchestre la récupération du flux, la comparaison des IDs et la notification.
 */
const verifierStatutGoogleWorkspace = () => {
  try {
    console.time("Execution_Verification"); // Mesure de performance
    
    // 1. Initialisation et récupération des données persistantes
    const serviceProprietes = PropertiesService.getScriptProperties();
    const idsStockesBrut = serviceProprietes.getProperty(CONFIG.CLE_IDS_VUS);
    
    // Utilisation d'un Set pour une complexité de recherche en O(1)
    const ensembleIdsVus = idsStockesBrut ? new Set(JSON.parse(idsStockesBrut)) : new Set();
    
    // 2. Récupération et parsing du flux RSS
    const reponseHttp = UrlFetchApp.fetch(CONFIG.URL_FLUX);
    const contenuXml = reponseHttp.getContentText();
    const documentXml = XmlService.parse(contenuXml);
    const espaceNomAtom = XmlService.getNamespace(CONFIG.NAMESPACE_ATOM);
    
    // Conversion de la liste Java en tableau JS pour utiliser les méthodes modernes
    const racine = documentXml.getRootElement();
    const listeEntreesXml = Array.from(racine.getChildren("entry", espaceNomAtom));

    // 3. Traitement des incidents (du plus ancien au plus récent)
    const nouveauxIdsDetectes = [];
    
    listeEntreesXml
      .reverse() // Inversion pour chronologie correcte (ancien -> récent)
      .forEach(entreeXml => {
        const idIncident = entreeXml.getChild("id", espaceNomAtom).getText();

        if (!ensembleIdsVus.has(idIncident)) {
          Logger.log(`Nouvel incident identifié : ${idIncident}`);
          
          // Extraction des données
          const detailsIncident = extraireDetailsEntree(entreeXml, espaceNomAtom);
          
          // Notification
          envoyerAlerteEmail(detailsIncident);
          
          // Mise en mémoire
          nouveauxIdsDetectes.push(idIncident);
          ensembleIdsVus.add(idIncident);
        }
      });

    // 4. Sauvegarde par lots (Batch Operation)
    if (nouveauxIdsDetectes.length > 0) {
      // Conversion du Set en Array pour stockage JSON
      const tableauIdsAJour = Array.from(ensembleIdsVus);
      serviceProprietes.setProperty(CONFIG.CLE_IDS_VUS, JSON.stringify(tableauIdsAJour));
      Logger.log(`${nouveauxIdsDetectes.length} nouveaux incidents enregistrés.`);
    } else {
      Logger.log("R.A.S : Aucun nouvel incident détecté.");
    }
    
    console.timeEnd("Execution_Verification");

  } catch (erreur) {
    console.error(`Erreur critique dans verifierStatutGoogleWorkspace : ${erreur.message}`);
    // Optionnel : S'envoyer un email de rapport d'erreur ici
  }
};

/**
 * Extrait les informations pertinentes d'un élément XML <entry>.
 * * @param {GoogleAppsScript.XML_Service.Element} elementXml - L'élément XML entry.
 * @param {GoogleAppsScript.XML_Service.Namespace} espaceNom - Le namespace Atom.
 * @return {Object} Un objet contenant titre, lien et résumé.
 */
const extraireDetailsEntree = (elementXml, espaceNom) => {
  const titre = elementXml.getChild("title", espaceNom).getText();
  const lien = elementXml.getChild("link", espaceNom).getAttribute("href").getValue();
  const resumeHtml = elementXml.getChild("summary", espaceNom).getText();
  
  return { titre, lien, resumeHtml };
};

/**
 * Envoie une notification email formattée via MailApp.
 * * @param {Object} details - Objet contenant les infos de l'incident (titre, lien, resumeHtml).
 */
const envoyerAlerteEmail = ({ titre, lien, resumeHtml }) => {
  try {
    const emailUtilisateur = Session.getActiveUser().getEmail();
    const objetEmail = `🚨 Alerte Google Workspace : ${titre}`;
    
    const corpsHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #d93025;">Nouvel incident détecté</h2>
        <h3 style="background-color: #f1f3f4; padding: 10px; border-radius: 4px;">${titre}</h3>
        
        <div style="border: 1px solid #e0e0e0; padding: 15px; margin: 15px 0; border-radius: 5px; background-color: #fafafa;">
          ${resumeHtml}
        </div>
        
        <p>
          <a href="${lien}" style="background-color: #1a73e8; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Voir le tableau de bord
          </a>
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;">
        <p style="font-size: 12px; color: #666;">Envoyé automatiquement par votre script de surveillance.</p>
      </div>
    `;
    
    MailApp.sendEmail({
      to: emailUtilisateur,
      subject: objetEmail,
      htmlBody: corpsHtml,
      noReply: true
    });
    
  } catch (erreur) {
    console.error(`Echec d'envoi email pour "${titre}" : ${erreur.message}`);
  }
};
