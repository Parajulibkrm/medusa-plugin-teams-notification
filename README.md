# Medusa Teams Notification Plugin

This Plugin offers a way to receieve notifications from Medusa on Ms Teams.



## Set up Project

### Prerequisites
- Medusa Backend/Frontend/admin Setup
- [MS Teams Webhook](https://www.youtube.com/watch?v=amvh4rzTCS0)


### Installation
- Clone this repo
- Configure below paramers in backend medsa-config.js file
```js
  {
    resolve: `medusa-plugin-teams-notification`,
     options: {
	  show_discount_code: `<true|false>`,
      webhook_url: `<WEBHOOK_URL>`,
      admin_orders_url: `http://localhost:7001/a/orders`,
    }
}

```
- add local package using [npm link](https://docs.medusajs.com/advanced/backend/plugins/create/#test-your-plugin) with backend repo
- setup REDIS_URL in projectConfig, For notification queue

## Resources
- https://docs.medusajs.com/usage/local-development/
- https://docs.medusajs.com/advanced/backend/plugins/create/
