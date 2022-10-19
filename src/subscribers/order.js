class OrderSubscriber {
	constructor({ msTeamsService, eventBusService }) {
		this.msTeamsService = msTeamsService

		this.eventBus_ = eventBusService

		this.eventBus_.subscribe("order.placed", async ({ id }) => {
			await this.msTeamsService.orderNotification(id)
		})
	}
}

export default OrderSubscriber