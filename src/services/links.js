import {
 	APPSTORE_ID,
 	IOS_BUNDLE_ID,
 	ANDROID_PACKAGE_NAME
} from '../utilities/Constants';

/**
 * Creates a deep link for an event
 * @param {string} eventId Event identifier on the database
 * @param {string} title Title for the link
 * @param {string} description Description for the link
 * @param {string} eventPhoto URL of the photo of the event
 */
export async function createEventInvitationDeepLink(eventId, title, description, eventPhoto) {
	const link = await fetch('https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyAwrwwTRiyYV7-SzOvE6kEteE0lmYhBe8c',
		{
			method: 'POST',
			body: JSON.stringify({
				"dynamicLinkInfo": {
					"domainUriPrefix": "https://qapla.page.link",
					"link": `https://qapla.gg/?type=appDeepLink\&type2=eventInvitation\&eventId=${eventId}`,
					"androidInfo": {
					  "androidPackageName": ANDROID_PACKAGE_NAME
					},
					"iosInfo": {
					  "iosBundleId": IOS_BUNDLE_ID,
					  "iosAppStoreId": APPSTORE_ID
					},
					"socialMetaTagInfo": {
						"socialTitle": title,
						"socialDescription": description,
						"socialImageLink": eventPhoto
					}
				}
			})
		}
	);
	return (await link.json()).shortLink;
}
