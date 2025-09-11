import {describe, expect, it} from "vitest";
import {mount} from "@vue/test-utils";
import SearchBar from "../SearchBar.vue";

describe('SearchBar', () => {
    it.todo('should show a search textbox input');

    it.todo('should show a search submit button');

    it('emits a "search" event with the query when the form is submitted', async () => {
        // Arrange: mount the component
        const wrapper = mount(SearchBar);
        const input = wrapper.find('input[type="text"]');
        const form = wrapper.find('form');

        // Act: simulate a user typing "Kitchener" into the input
        const inputValue = 'Kitchener';
        await input.setValue(inputValue);
        await form.trigger('submit');

        // Assert
        // Check if a 'search' event was emitted
        expect(wrapper.emitted()).toHaveProperty('search')
        // Check if the event payload is correct
        expect(wrapper.emitted('search')?.[0]).toEqual([inputValue]);
    });
})