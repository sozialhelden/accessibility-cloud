# People

- **Alex** - is a user of wheelmap who frequently travels and a wheelmap contributor
- **Betty** - is a maintainer of project a11y.hotel that the collects a11y data and wants to increase its impact
- **Claire** - is a member of AC and supports Alex and Betty to use AC. 
- **Dave** - is a developer of an Location based service hotels1234.com and has to integrate data from AC.
- **Eve** - is the manager of hotels1234.com and wants to improve the user experience

# Use Cases

## Betty contributes a11y.hotel to AC

- Betty learns that an integration with AC has a lot of advantages like...
    - give one get a lot...
    - ...

- Betty opens the AC websites and...
    - ...is amazed how many likeminded projects and organizations there are.
    - ...learns how big the reach and the traffic of AC is.
    - ...the AC is a stable institution that will be around for a couple of years.
    - ...using the AC is and will stay free of charge?

- Betty signs up as a user
- Betty adds a11y.hotel as an **organization**.
- Betty confirms the AC-TOCs for her organization.
- Betty learns that the friendly and competent AC support-team will assist her with the integration.
- Betty adds `all-a11y-hotels` as a **data-source**.
- Betty provides all required details for the data-source:
    - the organization own the data in question
    - its license is CC0 / CCBY / Custom 
    - if it should be visible in the sandbox
- Betty **uploads sample data**.
- After uploading sample data, an **AC assistant** contacts her and offers to...
    - ...validate the data consistancy
    - ...implement mapping data into the generic AC-format
    - ...optimize matching with all other data-sources.
- If Betty is motivated, she can use the **AC-mapping sandbox** to map her data to the required AC-attributes (id, long, lat, name, accessibility). Otherwise the AC assistant would do this.
- Betty provides the current data-source as one of the following:
    - an upload of all the places as a csv or json-file
    - an API endpoint
    - a endpoint to regularily download the data as a csv-file

### Additionally

- Betty learns that she could use CC0 data to optimize and extend her own database. NOTE TO SELF: if people frequently import the AC-CC0-Database into their own project we have to **prevent double reimports**.

## Betty pitches a11y.hotel to Eve (hotels1234.com)

- Eve sends an Email to Dave to check out the feasibility and effort of integration.



## Dave wants to access data from AC

- Dave gets a briefing from from Eve to check the feasibility of an integration to AC data.
- Dave opens the website and looks for documentation (examples, reference-projects, data structure).
- Dave looks at github for libraries to use the AC API.
- Dave wants to download a list of places
- Dave wants to check how many hotels are in the database
- Dave uses a well-known hotel "Adlon" and uses AC to see: if the entry exists, how data-structure looks like, if the data is compatible with his hotel1234's infrastructure.
- Dave checks potential integration scenarios like... 
	- regularily downloading the complete database
	- getting a11y details for a certain hotel on the fly

- Dave finds the dataentry for "Adlon" and validates how he could match that entry to the entry in his database.
- Dave wonders if he could get (perferably one) result for a query like..
 	{cat: 'hotels', name: 'Adlon', lat: 123, long: 123}
- Dave finds the query-sandbox, enters his data. and is very pleased to get some(!) results from different sources.
- Dave sees the that response contains information on the data-source and licences.
- Dave finds links to the sources and their respective licences.
- Dave finds one link the explains the possible licences and emails it to Eve.
- Eve tells Dave to try the integration but stick to CC0 and CCBY for now.
- Dave learns from the documentation that he needs an API-token and has to sign up for this.
- In the sign-up form, Dave sees a long terms&conditions text and forwards this to Eve.
- ??? Dave and skip signing the terms and can continue with the evaluation.
- Dave can to provide the following information for...
	- His account...
		- Email
		- Password
		- ??? Name
		- ??? Role in the orginization
- Dave confirms his email through the validation link.
- Dave sees the to continue, he has to create an organization with the following information.
	- Organization...
		- Name
		- Country?
		- ??? what do you want to do the data?
		- Legal-type (single person, student, company, non-comerical project, official department, other)
		- Addresse
		- Phone-Number
		- Web-Site
		- Logo?
		- Accepts TOC
- Dave learns that if he doens't know some of the attributes, he can invite an additional person to fillout and sign the TOC
- Dave invites Eve to complete the data for hotel1234.
- ??? Dave may be able to continue the evaluation even it TOC haven't been signed yet.
- ??? Dave learns that for creating an API Token, he needs app-entry "hotel1234.com-site"
- Dave creates a API token for his organization
- Dave learns, that unless somebody from his organization acceps the TOCs his access to the API is limited.
- ??? Dave sees that his API can (and should) specify an API version
- ??? Dave sends some sample requests and learns that the requests are limited until somebody (Eve) signs the TOCs.
- Dave adds the __Place Details__ sample code to the hotel1234.com that...
	- shows the accessibility-for a hotel on the details-page
	- shows the required attribution information and back-link
	- nothing if accessibility is unclear -> eventually this could become a contribution link
- Dave adds the  __Places Summary__ sample to list that shows the accessibility of hotels in the search-results-list
- Dave adds the __Search accessible places__ sample the adds a new feature to the limit the search to accessible hotels.

# More questions
### Categories
- How do we define a meaningful set of categories.
- Do we have mapping-tables to other categories-lists like OSM, google-places, etc.