import { ExtensionComponent } from "../../core/component";
import ConfigurationComponent from "../../core/nested-option";
import { mount, React, shallow } from "./setup";
import { TestComponent, Widget, WidgetClass } from "./test-component";

const ExtensionWidgetClass = jest.fn(() => Widget);

// tslint:disable:max-classes-per-file
class TestExtensionComponent<P = any> extends ExtensionComponent<P> {

    constructor(props: P) {
        super(props);

        this._WidgetClass = ExtensionWidgetClass;
    }
}

class NestedComponent extends ConfigurationComponent<{ a: number }> {
    public static OwnerType = TestExtensionComponent;
    public static OptionName = "option1";
}

// tslint:enable:max-classes-per-file

it("does not create widget on componentDidMount", () => {
    shallow(
        <TestExtensionComponent />
    );

    expect(ExtensionWidgetClass).toHaveBeenCalledTimes(0);
});

it("creates widget on componentDidMount inside another component on same element", () => {
    mount(
        <TestComponent>
            <TestExtensionComponent />
        </TestComponent>
    );

    expect(ExtensionWidgetClass).toHaveBeenCalledTimes(1);
    expect(ExtensionWidgetClass.mock.calls[0][0]).toBe(WidgetClass.mock.calls[0][0]);
});

it("unmounts without errors", () => {
    const component = shallow(
        <TestExtensionComponent />
    );

    expect(component.unmount.bind(component)).not.toThrow();
});

it("pulls options from a single nested component", () => {
    mount(
        <TestComponent>
            <TestExtensionComponent>
                <NestedComponent a={123} />
            </TestExtensionComponent>
        </TestComponent>
    );

    const options = ExtensionWidgetClass.mock.calls[0][1];

    expect(options).toHaveProperty("option1");
    expect(options.option1).toMatchObject({
        a: 123
    });
});
